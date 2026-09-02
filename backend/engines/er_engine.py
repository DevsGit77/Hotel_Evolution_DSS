import numpy as np

UTILITIES = np.array([0.0, 0.25, 0.5, 0.75, 1.0], dtype=np.float64)
N_GRADES = 5
EPS = 1e-9


class EREngine:
    """Evidential Reasoning (ER) engine based on the Dempster-Shafer theory.

    Each criterion supplies a belief distribution over the five assessment
    grades [VL, L, M, H, VH]. The remaining probability mass (1 - sum(beliefs))
    represents ignorance (uncertainty). Sources are combined sequentially using
    Dempster's rule of combination, producing an aggregated belief distribution
    together with the residual ignorance mass.
    """

    def __init__(self, utilities=None):
        self.utilities = np.array(utilities if utilities is not None else UTILITIES, dtype=np.float64)

    # ------------------------------------------------------------------ #
    def validate_belief(self, beliefs):
        beliefs = np.asarray(beliefs, dtype=np.float64)
        if beliefs.ndim != 1:
            raise ValueError("Belief must be a 1D array of degree values")
        if beliefs.shape[0] != N_GRADES:
            raise ValueError(f"Belief must contain exactly {N_GRADES} degrees")
        if np.any(beliefs < -EPS) or np.any(beliefs > 1.0 + EPS):
            raise ValueError("Belief degree must be between 0 and 1")
        if np.sum(beliefs) > 1.0 + 1e-6:
            raise ValueError("Belief degrees must sum to <= 1.0 (the remainder is ignorance)")
        return True

    def normalize_belief(self, beliefs):
        beliefs = np.asarray(beliefs, dtype=np.float64)
        s = np.sum(beliefs)
        if s <= EPS:
            return np.zeros(N_GRADES, dtype=np.float64)
        return beliefs / s

    def calculate_utility(self, beliefs):
        beliefs = np.asarray(beliefs, dtype=np.float64)
        return float(np.dot(beliefs, self.utilities))

    def create_masses(self, belief, weight=1.0):
        masses = np.empty(N_GRADES + 1, dtype=np.float64)
        masses[:N_GRADES] = weight * np.asarray(belief, dtype=np.float64)
        masses[N_GRADES] = max(0.0, 1.0 - np.sum(masses[:N_GRADES]))
        return masses

    def combine_masses(self, m1, m2):
        m1 = np.asarray(m1, dtype=np.float64)
        m2 = np.asarray(m2, dtype=np.float64)
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
            raise ValueError("Complete conflict detected while combining — no belief can be assigned")
        return result / K

    def aggregate(self, belief_list, weights=None):
        belief_list = [np.asarray(b, dtype=np.float64) for b in belief_list]
        if not belief_list:
            raise ValueError("At least one belief distribution is required")

        # The weight of a source scales its confidence (importance).
        n = len(belief_list)
        if weights is None:
            weights = np.ones(n) / n
        else:
            weights = np.asarray(weights, dtype=np.float64)
            if weights.shape[0] != n:
                raise ValueError("Number of beliefs and weights must match")

        masses_list = []
        for belief, weight in zip(belief_list, weights):
            self.validate_belief(belief)
            norm = self.normalize_belief(belief)
            masses_list.append(self.create_masses(norm, float(weight)))

        current = masses_list[0]
        for i in range(1, len(masses_list)):
            current = self.combine_masses(current, masses_list[i])

        final_belief = current[:N_GRADES]
        s = np.sum(final_belief)
        if s > EPS:
            final_belief = final_belief / s

        return {
            'belief': final_belief.tolist(),
            'utility': self.calculate_utility(final_belief),
            'ignorance': float(current[N_GRADES])
        }
