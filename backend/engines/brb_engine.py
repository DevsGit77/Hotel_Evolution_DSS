import numpy as np

UTILITIES = np.array([0.0, 0.25, 0.5, 0.75, 1.0], dtype=np.float64)
N_GRADES = 5
EPS = 1e-9


class BRBEngine:
    """Belief Rule Base (BRB) inference engine.

    Implements Yang's belief-rule-based approach:
      1. Each rule is an IF-THEN statement over referential grade combinations
         with a rule weight (theta) and a consequent belief distribution.
      2. For a given observation (a belief distribution over grades for each
         antecedent), the matching degree of a rule is the product of the belief
         degrees of the grades referenced by each antecedent.
      3. Activation weight = normalised (matching_degree * theta).
      4. Consequents are aggregated with the Evidential Reasoning algorithm
         (Dempster-Shafer combination) so that partial matching is handled
         properly and total belief remains coherent.
    """

    def __init__(self, utilities=None):
        self.utilities = np.array(utilities if utilities is not None else UTILITIES, dtype=np.float64)

    # ------------------------------------------------------------------ #
    # Validation
    # ------------------------------------------------------------------ #
    def validate_observation(self, observation):
        obs = np.asarray(observation, dtype=np.float64)
        if obs.ndim != 2:
            raise ValueError("Observation must be a 2D array: [antecedent][grade]")
        if obs.shape[1] != N_GRADES:
            raise ValueError(f"Each antecedent must have exactly {N_GRADES} belief degrees")
        if np.any(obs < -EPS) or np.any(obs > 1.0 + EPS):
            raise ValueError("Belief degrees must be between 0 and 1")
        sums = obs.sum(axis=1)
        if np.any(sums > 1.0 + 1e-6):
            raise ValueError("Belief degrees in an antecedent must sum to <= 1.0")
        return obs

    def validate_rule(self, rule):
        consequent = np.asarray(rule.get('consequent', []), dtype=np.float64)
        if consequent.shape[0] != N_GRADES:
            raise ValueError(f"Consequent must have exactly {N_GRADES} belief degrees")
        if np.any(consequent < -EPS) or np.any(consequent > 1.0 + EPS):
            raise ValueError("Consequent belief degrees must be between 0 and 1")
        if np.sum(consequent) > 1.0 + 1e-6:
            raise ValueError("Consequent belief degrees must sum to <= 1.0")
        for grade in rule.get('antecedents', []):
            if not isinstance(grade, (int, np.integer)) or grade < 0 or grade >= N_GRADES:
                raise ValueError("Antecedent grade must be an integer in [0, 4]")
        return True

    # ------------------------------------------------------------------ #
    # Core steps
    # ------------------------------------------------------------------ #
    def calculate_matching_degree(self, observation, rule):
        """Belief-distribution (fuzzy) matching degree for a rule."""
        matching = 1.0
        for ant_idx, grade_idx in enumerate(rule.get('antecedents', [])):
            matching *= observation[ant_idx][grade_idx]
        return float(matching)

    def calculate_activation_weights(self, observations, rules):
        """Raw then normalised activation weights (matching_degree * theta)."""
        raw_weights = []
        for rule in rules:
            md = self.calculate_matching_degree(observations, rule)
            raw_weights.append(md * float(rule.get('weight', 1.0)))
        total = sum(raw_weights)
        normalised = []
        for rw in raw_weights:
            normalised.append(rw / total if total > EPS else 0.0)
        return raw_weights, normalised

    # ------------------------------------------------------------------ #
    # Aggregation methods
    # ------------------------------------------------------------------ #
    def _aggregate_er(self, updated_rules):
        """Aggregate weighted rule consequents using Dempster-Shafer (ER)."""
        # Add an ignorance mass and combine pairwise using the ER rule.
        masses = []
        for belief in updated_rules:
            b = np.asarray(belief, dtype=np.float64)
            m = np.empty(N_GRADES + 1, dtype=np.float64)
            m[:N_GRADES] = b
            m[N_GRADES] = max(0.0, 1.0 - np.sum(b))
            masses.append(m)
        current = masses[0]
        for i in range(1, len(masses)):
            current = self._combine_two_masses(current, masses[i])
        belief = current[:N_GRADES]
        s = np.sum(belief)
        belief = belief / s if s > EPS else belief
        return belief.tolist(), float(current[N_GRADES])

    def _combine_two_masses(self, m1, m2):
        result = np.zeros(N_GRADES + 1, dtype=np.float64)
        conflict = 0.0
        for i in range(N_GRADES):
            result[i] = m1[i] * m2[i] + m1[i] * m2[N_GRADES] + m2[i] * m1[N_GRADES]
        for i in range(N_GRADES):
            for j in range(N_GRADES):
                if i != j:
                    conflict += m1[i] * m2[j]
        result[N_GRADES] = m1[N_GRADES] * m2[N_GRADES]
        K = 1.0 - conflict
        if K <= 0:
            raise ValueError("Complete conflict detected while combining rule consequents")
        return result / K

    def _aggregate_weighted(self, updated_rules):
        """Simple weighted-average aggregation fallback."""
        final = np.zeros(N_GRADES, dtype=np.float64)
        for belief in updated_rules:
            final += np.asarray(belief, dtype=np.float64)
        s = np.sum(final)
        final = final / s if s > EPS else final
        return final.tolist(), 0.0

    # ------------------------------------------------------------------ #
    # Public inference
    # ------------------------------------------------------------------ #
    def infer(self, observations, rules, method='analytical_er'):
        observations = self.validate_observation(observations)
        for rule in rules:
            self.validate_rule(rule)

        if not rules:
            raise ValueError("At least one rule is required")

        if len(rules[0].get('antecedents', [])) != observations.shape[0]:
            raise ValueError(
                "Number of antecedents in rules must match number of observation inputs"
            )

        raw_weights, activation_weights = self.calculate_activation_weights(observations, rules)

        # Updated rules = consequent belief multiplied by its activation weight.
        updated_rules = []
        for rule, aw in zip(rules, activation_weights):
            consequent = np.asarray(rule.get('consequent', []), dtype=np.float64)
            updated_rules.append(consequent * aw)

        if method == 'simple' or method == 'weighted_average':
            belief, ignorance = self._aggregate_weighted(updated_rules)
        else:
            belief, ignorance = self._aggregate_er(updated_rules)

        utility = float(np.dot(np.asarray(belief, dtype=np.float64), self.utilities))

        matching_degrees = [
            self.calculate_matching_degree(observations, rule) for rule in rules
        ]

        return {
            'activation_weights': activation_weights,
            'raw_weights': raw_weights,
            'matching_degrees': matching_degrees,
            'belief': belief,
            'utility': utility,
            'ignorance': ignorance,
            'method': method
        }

    def calculate_utility(self, belief):
        return float(np.dot(np.asarray(belief, dtype=np.float64), self.utilities))
