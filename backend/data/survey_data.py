SURVEY_DATA = {
  "w1": {
    "Cultural sites (w11)": [0.118, 0.235, 0.235, 0.118, 0.294],
    "Health Care (w12)": [0.000, 0.235, 0.235, 0.235, 0.294],
    "Transportation links (w13)": [0.059, 0.059, 0.176, 0.176, 0.529],
    "Business area (w14)": [0.235, 0.000, 0.353, 0.294, 0.118],
    "Transport hubs (w15)": [0.059, 0.118, 0.176, 0.176, 0.471],
    "Shopping and dining (w16)": [0.118, 0.059, 0.176, 0.235, 0.412],
    "Safety infrastructure (w17)": [0.000, 0.000, 0.176, 0.471, 0.353],
    "Recreation (w18)": [0.000, 0.118, 0.176, 0.412, 0.294]
  },
  "w2": {
    "Room price / nightly rate (w21)": [0.059, 0.059, 0.412, 0.294, 0.176],
    "Additional costs — breakfast, utilities, service charges (w22)": [0.059, 0.118, 0.353, 0.353, 0.118]
  },
  "w3": {
    "Location (w31)": [0.176, 0.000, 0.176, 0.294, 0.353],
    "Attractiveness (w32)": [0.118, 0.118, 0.176, 0.353, 0.235],
    "Safety (w33)": [0.000, 0.000, 0.235, 0.176, 0.588],
    "Environment (w34)": [0.000, 0.059, 0.118, 0.471, 0.353],
    "Neighborhood (w35)": [0.176, 0.000, 0.176, 0.529, 0.118],
    "Certification (w36)": [0.176, 0.000, 0.471, 0.059, 0.294],
    "Population density (w37)": [0.176, 0.118, 0.412, 0.176, 0.118]
  }
}

GRADES = ["Very Low", "Low", "Middle", "High", "Very High"]
GRADE_KEYS = ["VL", "L", "M", "H", "VH"]


def get_survey_data():
    return SURVEY_DATA


def get_grades():
    return GRADES


def get_grade_keys():
    return GRADE_KEYS
