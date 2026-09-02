import numpy as np
from engines.er_engine import EREngine, N_GRADES
from engines.brb_engine import BRBEngine, EPS

UTILITIES = [0.0, 0.25, 0.5, 0.75, 1.0]


class CombinedEngine:
    """Combined ER -> BRB analysis engine.

    Pipeline:
      1. Within each criteria group, the sub-criteria belief distributions are
         aggregated with the Evidential Reasoning (ER / Dempster-Shafer)
         algorithm to produce a group-level belief distribution + utility.
      2. The group-level belief distributions then form the *observations* of a
         Belief Rule Base (BRB). The BRB applies the configured IF-THEN rules
         and outputs a final aggregated belief distribution.

    The result object distinguishes the intermediate ER output (per group) from
    the final BRB output so the two methods are clearly reported.
    """

    def __init__(self):
        self.er = EREngine()
        self.brb = BRBEngine()

    # ------------------------------------------------------------------ #
    def _get_raw(self, grp_key, sub, grp_data, beliefs_data):
        if beliefs_data and grp_key in beliefs_data and sub in beliefs_data[grp_key]:
            return np.asarray(beliefs_data[grp_key][sub], dtype=np.float64)
        return np.asarray(grp_data[sub], dtype=np.float64)

    def aggregate_groups_with_er(self, groups, group_weights, sub_weights=None, beliefs_data=None):
        """Aggregate sub-criteria within each group using ER.

        Returns group-level belief distributions, utilities, and a per-group
        breakdown ready for the final ER (across groups) step.
        """
        group_scores = {}
        all_sub_results = []
        for grp_key, grp_data in groups.items():
            subs = list(grp_data.keys())
            n_subs = len(subs)

            beliefs = []
            weights = []
            for sub in subs:
                raw = self._get_raw(grp_key, sub, grp_data, beliefs_data)
                s = np.sum(raw)
                norm = raw / s if s > EPS else raw
                self.er.validate_belief(norm)

                sw = 1.0 / n_subs
                if sub_weights and grp_key in sub_weights and sub in sub_weights[grp_key]:
                    sw = float(sub_weights[grp_key][sub])

                beliefs.append(norm)
                weights.append(sw)
                all_sub_results.append({
                    'group': grp_key,
                    'sub': sub,
                    'normalized': norm.tolist(),
                    'utility': float(np.dot(norm, UTILITIES)),
                    'weight': sw
                })

            # ER aggregation within the group (weight = relative importance).
            group = self.er.aggregate(beliefs, weights)
            group_scores[grp_key] = {
                'utility': group['utility'],
                'belief': group['belief'],
                'ignorance': group['ignorance']
            }
        return group_scores, all_sub_results

    # ------------------------------------------------------------------ #
    def final_via_er(self, group_scores, group_weights):
        """Aggregate the group beliefs with ER across groups."""
        ordered = list(group_scores.keys())
        beliefs = [np.asarray(group_scores[g]['belief']) for g in ordered]
        weights = [float(group_weights.get(g, 0.0)) for g in ordered]
        total_w = sum(weights)
        if total_w <= EPS:
            raise ValueError("Group weights must sum to > 0")
        weights = [w / total_w for w in weights]
        result = self.er.aggregate(beliefs, weights)
        return result['belief'], result['utility'], result['ignorance'], 'ER (across groups)'

    # ------------------------------------------------------------------ #
    def final_via_brb(self, group_scores, group_weights, brb_rules):
        """Feed group beliefs into a BRB and return the final belief."""
        ordered = list(group_scores.keys())
        observations = [np.asarray(group_scores[g]['belief']) for g in ordered]
        for rule in brb_rules:
            rule['antecedents'] = rule.get('antecedents', [0] * len(ordered))
        result = self.brb.infer(observations, brb_rules)
        return result['belief'], result['utility'], result['ignorance'], result

    # ------------------------------------------------------------------ #
    def analyze(self, groups, group_weights, sub_weights=None, beliefs_data=None,
                brb_rules=None, final_method='er'):
        """Run the combined analysis.

        final_method: 'er' -> full evidential reasoning across groups,
                      'brb' -> BRB inference across groups.
        """
        group_scores, all_sub_results = self.aggregate_groups_with_er(
            groups, group_weights, sub_weights, beliefs_data
        )

        total_w = sum(group_weights.values())
        if total_w <= EPS:
            raise ValueError("Group weights must sum to > 0")

        if final_method == 'brb':
            if not brb_rules:
                raise ValueError("BRB rules are required for the BRB combined method")
            belief, utility, ignorance, brb_detail = self.final_via_brb(
                group_scores, group_weights, brb_rules
            )
            final_method_label = 'BRB (across groups)'
            brb_info = {
                'activation_weights': brb_detail['activation_weights'],
                'matching_degrees': brb_detail['matching_degrees'],
                'rule_count': len(brb_rules)
            }
        else:
            belief, utility, ignorance, label = self.final_via_er(group_scores, group_weights)
            final_method_label = label
            brb_info = None

        belief = np.asarray(belief, dtype=np.float64)
        top_idx = int(np.argmax(belief))

        return {
            'group_scores': group_scores,
            'all_sub_results': all_sub_results,
            'final_belief': belief.tolist(),
            'final_utility': float(utility),
            'ignorance': float(ignorance),
            'top_grade_index': top_idx,
            'final_method': final_method_label,
            'brb_info': brb_info
        }
