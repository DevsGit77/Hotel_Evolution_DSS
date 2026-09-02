import numpy as np
from engines.er_engine import EREngine, N_GRADES, EPS
from engines.brb_engine import BRBEngine

UTILITIES = [0.0, 0.25, 0.5, 0.75, 1.0]


def build_hotel_data(survey_data, hotel):
    """Normalise a hotel's input into the full survey sub-criteria structure.

    Every group / sub-criterion of `survey_data` must be present in the hotel.
    Missing entries default to an uninformative (flat) distribution.
    """
    groups = {}
    for grp_key, grp_data in survey_data.items():
        beliefs = []
        subs = list(grp_data.keys())
        hotel_sub = (hotel.get('groups', {}) or {}).get(grp_key, {})
        hotel_beliefs = hotel_sub.get('beliefs', []) if hotel_sub else []
        # hotel_beliefs may either be a full parallel list (one per sub) or a dict keyed by sub name.
        by_name = hotel_sub.get('by_name', {}) if hotel_sub else {}
        for i, sub in enumerate(subs):
            if sub in by_name:
                b = by_name[sub]
            elif hotel_beliefs and i < len(hotel_beliefs):
                b = hotel_beliefs[i]
            else:
                b = [0.2, 0.2, 0.2, 0.2, 0.2]
            b = np.asarray(b, dtype=np.float64)
            if b.shape[0] != N_GRADES:
                b = np.array([0.2, 0.2, 0.2, 0.2, 0.2], dtype=np.float64)
            s = float(np.sum(b))
            if s > EPS and s != 1.0:
                b = b / s
            beliefs.append(b.tolist())
        groups[grp_key] = {'subs': subs, 'beliefs': beliefs}
    return groups


class RankingEngine:

    def __init__(self):
        self.er = EREngine()
        self.brb = BRBEngine()

    def evaluate_hotel(self, survey_data, hotel, group_weights, sub_weights, brb_rules):
        """ER within each group -> BRB across groups for a single hotel."""
        groups = build_hotel_data(survey_data, hotel)
        group_er_utilities = []
        group_er_beliefs = []
        group_er_ignorance = []

        for grp_key, g in groups.items():
            beliefs = g['beliefs']
            n = len(beliefs)
            weights = []
            for i, sub in enumerate(g['subs']):
                sw = 1.0 / n
                if sub_weights and grp_key in sub_weights and sub in sub_weights[grp_key]:
                    sw = float(sub_weights[grp_key][sub])
                weights.append(sw)
            er = self.er.aggregate(beliefs, weights)
            group_er_beliefs.append(er['belief'])
            group_er_utilities.append(er['utility'])
            group_er_ignorance.append(er['ignorance'])

        # BRB across groups.
        brb_result = self.brb.infer(group_er_beliefs, brb_rules)
        return {
            'hotel': hotel.get('name', 'Unknown'),
            'location': hotel.get('location', ''),
            'group_er_utilities': group_er_utilities,
            'group_er_beliefs': group_er_beliefs,
            'group_er_ignorance': group_er_ignorance,
            'belief': brb_result['belief'],
            'utility': brb_result['utility'],
            'ignorance': brb_result['ignorance']
        }

    def rank_hotels(self, survey_data, hotels, group_weights, sub_weights, brb_rules):
        if not hotels:
            raise ValueError("No hotel data provided")
        if not brb_rules:
            raise ValueError("At least one BRB rule is required")
        for h in hotels:
            if not h.get('name'):
                raise ValueError("Hotel name missing")

        results = [
            self.evaluate_hotel(survey_data, h, group_weights, sub_weights, brb_rules)
            for h in hotels
        ]
        results.sort(key=lambda r: r['utility'], reverse=True)
        for i, r in enumerate(results):
            r['rank'] = i + 1
        return results

    def get_winner(self, ranked_hotels):
        return ranked_hotels[0] if ranked_hotels else None
