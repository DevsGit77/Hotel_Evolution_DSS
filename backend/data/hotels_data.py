"""Real hotels around Rangamati Sadar (Rangamati Hill District, Bangladesh).

Belief degree arrays follow the grading scheme [VL, L, M, H, VH] for each
sub-criterion of the survey structure (w1 Facilities: 8 subs, w2 Cost: 2 subs,
w3 General: 7 subs). Values are indicative / editable by the user and are used
as sensible defaults for the ranking page.
"""

RANGAMATI_HOTELS = [
    {
        "name": "Hotel Green Castle",
        "location": "Banarupa, Rangamati Sadar",
        "groups": {
            "w1": {
                "by_name": {
                    "Cultural sites (w11)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Health Care (w12)": [0.12, 0.24, 0.29, 0.18, 0.18],
                    "Transportation links (w13)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Business area (w14)": [0.18, 0.24, 0.29, 0.18, 0.12],
                    "Transport hubs (w15)": [0.12, 0.18, 0.29, 0.24, 0.18],
                    "Shopping and dining (w16)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Safety infrastructure (w17)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Recreation (w18)": [0.06, 0.12, 0.24, 0.29, 0.29]
                }
            },
            "w2": {
                "by_name": {
                    "Room price / nightly rate (w21)": [0.18, 0.29, 0.29, 0.18, 0.06],
                    "Additional costs — breakfast, utilities, service charges (w22)": [0.18, 0.24, 0.29, 0.18, 0.12]
                }
            },
            "w3": {
                "by_name": {
                    "Location (w31)": [0.06, 0.12, 0.18, 0.29, 0.35],
                    "Attractiveness (w32)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Safety (w33)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Environment (w34)": [0.12, 0.18, 0.24, 0.29, 0.18],
                    "Neighborhood (w35)": [0.12, 0.18, 0.29, 0.24, 0.18],
                    "Certification (w36)": [0.18, 0.24, 0.29, 0.18, 0.12],
                    "Population density (w37)": [0.06, 0.12, 0.24, 0.29, 0.29]
                }
            }
        }
    },
    {
        "name": "Hotel Peda Ting Ting",
        "location": "Rangamati Sadar (Lakeside)",
        "groups": {
            "w1": {
                "by_name": {
                    "Cultural sites (w11)": [0.06, 0.12, 0.18, 0.29, 0.35],
                    "Health Care (w12)": [0.18, 0.24, 0.29, 0.18, 0.12],
                    "Transportation links (w13)": [0.06, 0.18, 0.24, 0.29, 0.24],
                    "Business area (w14)": [0.18, 0.24, 0.29, 0.18, 0.12],
                    "Transport hubs (w15)": [0.12, 0.24, 0.29, 0.18, 0.18],
                    "Shopping and dining (w16)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Safety infrastructure (w17)": [0.12, 0.18, 0.29, 0.24, 0.18],
                    "Recreation (w18)": [0.06, 0.12, 0.18, 0.29, 0.35]
                }
            },
            "w2": {
                "by_name": {
                    "Room price / nightly rate (w21)": [0.18, 0.24, 0.29, 0.18, 0.12],
                    "Additional costs — breakfast, utilities, service charges (w22)": [0.18, 0.29, 0.29, 0.18, 0.06]
                }
            },
            "w3": {
                "by_name": {
                    "Location (w31)": [0.06, 0.12, 0.18, 0.29, 0.35],
                    "Attractiveness (w32)": [0.06, 0.12, 0.18, 0.29, 0.35],
                    "Safety (w33)": [0.12, 0.18, 0.24, 0.29, 0.18],
                    "Environment (w34)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Neighborhood (w35)": [0.12, 0.18, 0.24, 0.29, 0.18],
                    "Certification (w36)": [0.12, 0.24, 0.29, 0.18, 0.18],
                    "Population density (w37)": [0.06, 0.18, 0.29, 0.24, 0.24]
                }
            }
        }
    },
    {
        "name": "Hotel Sufia International",
        "location": "Rangamati Sadar",
        "groups": {
            "w1": {
                "by_name": {
                    "Cultural sites (w11)": [0.06, 0.12, 0.29, 0.29, 0.24],
                    "Health Care (w12)": [0.12, 0.24, 0.29, 0.18, 0.18],
                    "Transportation links (w13)": [0.12, 0.18, 0.29, 0.24, 0.18],
                    "Business area (w14)": [0.18, 0.24, 0.29, 0.18, 0.12],
                    "Transport hubs (w15)": [0.06, 0.12, 0.29, 0.24, 0.29],
                    "Shopping and dining (w16)": [0.12, 0.18, 0.29, 0.24, 0.18],
                    "Safety infrastructure (w17)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Recreation (w18)": [0.12, 0.24, 0.29, 0.24, 0.12]
                }
            },
            "w2": {
                "by_name": {
                    "Room price / nightly rate (w21)": [0.24, 0.29, 0.29, 0.12, 0.06],
                    "Additional costs — breakfast, utilities, service charges (w22)": [0.18, 0.29, 0.29, 0.18, 0.06]
                }
            },
            "w3": {
                "by_name": {
                    "Location (w31)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Attractiveness (w32)": [0.12, 0.18, 0.29, 0.24, 0.18],
                    "Safety (w33)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Environment (w34)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Neighborhood (w35)": [0.12, 0.18, 0.29, 0.24, 0.18],
                    "Certification (w36)": [0.18, 0.24, 0.29, 0.18, 0.12],
                    "Population density (w37)": [0.06, 0.12, 0.29, 0.24, 0.29]
                }
            }
        }
    },
    {
        "name": "Hotel Sagar Parikha",
        "location": "Rangamati Sadar (Lakeside)",
        "groups": {
            "w1": {
                "by_name": {
                    "Cultural sites (w11)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Health Care (w12)": [0.18, 0.24, 0.29, 0.18, 0.12],
                    "Transportation links (w13)": [0.12, 0.18, 0.29, 0.24, 0.18],
                    "Business area (w14)": [0.18, 0.24, 0.29, 0.18, 0.12],
                    "Transport hubs (w15)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Shopping and dining (w16)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Safety infrastructure (w17)": [0.12, 0.18, 0.24, 0.29, 0.18],
                    "Recreation (w18)": [0.06, 0.18, 0.29, 0.24, 0.24]
                }
            },
            "w2": {
                "by_name": {
                    "Room price / nightly rate (w21)": [0.18, 0.29, 0.29, 0.18, 0.06],
                    "Additional costs — breakfast, utilities, service charges (w22)": [0.18, 0.24, 0.29, 0.18, 0.12]
                }
            },
            "w3": {
                "by_name": {
                    "Location (w31)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Attractiveness (w32)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Safety (w33)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Environment (w34)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Neighborhood (w35)": [0.12, 0.24, 0.29, 0.18, 0.18],
                    "Certification (w36)": [0.18, 0.24, 0.29, 0.18, 0.12],
                    "Population density (w37)": [0.06, 0.12, 0.29, 0.24, 0.29]
                }
            }
        }
    },
    {
        "name": "Hotel Nillima",
        "location": "Rangamati Sadar (Shilpacharya Zainul Abedin Road)",
        "groups": {
            "w1": {
                "by_name": {
                    "Cultural sites (w11)": [0.12, 0.18, 0.29, 0.24, 0.18],
                    "Health Care (w12)": [0.12, 0.24, 0.29, 0.18, 0.18],
                    "Transportation links (w13)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Business area (w14)": [0.18, 0.24, 0.29, 0.18, 0.12],
                    "Transport hubs (w15)": [0.12, 0.18, 0.29, 0.24, 0.18],
                    "Shopping and dining (w16)": [0.12, 0.18, 0.29, 0.24, 0.18],
                    "Safety infrastructure (w17)": [0.18, 0.24, 0.24, 0.18, 0.12],
                    "Recreation (w18)": [0.12, 0.24, 0.29, 0.24, 0.12]
                }
            },
            "w2": {
                "by_name": {
                    "Room price / nightly rate (w21)": [0.18, 0.29, 0.29, 0.18, 0.06],
                    "Additional costs — breakfast, utilities, service charges (w22)": [0.24, 0.29, 0.29, 0.12, 0.06]
                }
            },
            "w3": {
                "by_name": {
                    "Location (w31)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Attractiveness (w32)": [0.06, 0.12, 0.18, 0.29, 0.35],
                    "Safety (w33)": [0.12, 0.18, 0.24, 0.29, 0.18],
                    "Environment (w34)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Neighborhood (w35)": [0.12, 0.18, 0.24, 0.29, 0.18],
                    "Certification (w36)": [0.18, 0.24, 0.29, 0.18, 0.12],
                    "Population density (w37)": [0.06, 0.12, 0.29, 0.24, 0.29]
                }
            }
        }
    },
    {
        "name": "Hotel Banarupa (Kaptai View)",
        "location": "Rangamati Sadar (Banarupa)",
        "groups": {
            "w1": {
                "by_name": {
                    "Cultural sites (w11)": [0.06, 0.12, 0.18, 0.29, 0.35],
                    "Health Care (w12)": [0.12, 0.24, 0.29, 0.18, 0.18],
                    "Transportation links (w13)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Business area (w14)": [0.18, 0.24, 0.29, 0.18, 0.12],
                    "Transport hubs (w15)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Shopping and dining (w16)": [0.12, 0.18, 0.24, 0.29, 0.18],
                    "Safety infrastructure (w17)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Recreation (w18)": [0.06, 0.12, 0.18, 0.29, 0.35]
                }
            },
            "w2": {
                "by_name": {
                    "Room price / nightly rate (w21)": [0.24, 0.29, 0.29, 0.12, 0.06],
                    "Additional costs — breakfast, utilities, service charges (w22)": [0.18, 0.29, 0.29, 0.18, 0.06]
                }
            },
            "w3": {
                "by_name": {
                    "Location (w31)": [0.06, 0.12, 0.18, 0.29, 0.35],
                    "Attractiveness (w32)": [0.06, 0.12, 0.18, 0.29, 0.35],
                    "Safety (w33)": [0.06, 0.12, 0.24, 0.29, 0.29],
                    "Environment (w34)": [0.06, 0.12, 0.18, 0.29, 0.35],
                    "Neighborhood (w35)": [0.12, 0.18, 0.24, 0.29, 0.18],
                    "Certification (w36)": [0.18, 0.24, 0.29, 0.18, 0.12],
                    "Population density (w37)": [0.06, 0.12, 0.24, 0.29, 0.29]
                }
            }
        }
    }
]


def get_rangamati_hotels():
    return RANGAMATI_HOTELS
