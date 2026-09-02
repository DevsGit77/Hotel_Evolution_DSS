import numpy as np
from engines.combined_engine import CombinedEngine

UTILITIES = [0.0, 0.25, 0.5, 0.75, 1.0]


class SensitivityEngine:

    def __init__(self):
        self.combined = CombinedEngine()

    def systematic_sweep(self, groups, group_weights, sub_weights, beliefs_data, step=0.05):
        group_keys = list(group_weights.keys())
        results = []
        n_step = int(round(1.0 / step)) + 1
        for i in range(n_step):
            w = round(i * step, 4)
            if w > 1.0:
                w = 1.0
            remaining = 1.0 - w
            for gk in group_keys:
                test_weights = dict(group_weights)
                test_weights[gk] = w
                other_keys = [k for k in group_keys if k != gk]
                n_other = len(other_keys)
                if n_other > 0:
                    for ok in other_keys:
                        test_weights[ok] = remaining / n_other
                result = self.combined.analyze(groups, test_weights, sub_weights, beliefs_data)
                results.append({
                    'variable_group': gk,
                    'sweep_value': w,
                    'final_utility': result['final_utility'],
                    'group_scores': {k: v['utility'] for k, v in result['group_scores'].items()},
                    'final_belief': result['final_belief'],
                    'top_grade_index': result['top_grade_index']
                })
        return results

    def monte_carlo(self, groups, group_weights, sub_weights, beliefs_data, n_iterations=5000):
        group_keys = list(group_weights.keys())
        n_groups = len(group_keys)
        rng = np.random.default_rng()
        results = []
        for _ in range(n_iterations):
            raw = rng.exponential(1.0, n_groups)
            sampled_weights = raw / raw.sum()
            test_weights = dict(zip(group_keys, sampled_weights))
            result = self.combined.analyze(groups, test_weights, sub_weights, beliefs_data)
            results.append({
                'weights': dict(zip(group_keys, sampled_weights.tolist())),
                'final_utility': result['final_utility'],
                'final_belief': result['final_belief'],
                'top_grade_index': result['top_grade_index']
            })
        utilities = [r['final_utility'] for r in results]
        return {
            'iterations': n_iterations,
            'mean_utility': float(np.mean(utilities)),
            'std_utility': float(np.std(utilities)),
            'min_utility': float(np.min(utilities)),
            'max_utility': float(np.max(utilities)),
            'percentile_5': float(np.percentile(utilities, 5)),
            'percentile_25': float(np.percentile(utilities, 25)),
            'percentile_50': float(np.percentile(utilities, 50)),
            'percentile_75': float(np.percentile(utilities, 75)),
            'percentile_95': float(np.percentile(utilities, 95)),
            'results': results
        }
