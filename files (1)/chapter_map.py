# Page -> Chapter mapping for UD Trucks QUESTER Series Owner's Manual (1525764)
# Derived from ManualsLib TOC: https://www.manualslib.com/manual/1525764/Ud-Trucks-Quester-Series.html
# Ranges are inclusive start pages of each top-level chapter.

CHAPTER_RANGES = [
    (1, 8,   "Table of Contents"),
    (9, 40,  "1 Introduction and Safety"),
    (41, 52, "2 Getting in and out of the Cab"),
    (53, 104, "3 Equipment Description and Operation"),
    (105, 114, "4 Accessories and Audio"),
    (115, 122, "5 Airconditioning"),
    (123, 130, "6 Daily Inspection"),
    (131, 148, "7 Correct Driving Operation"),
    (149, 222, "8 Inspection and Maintenance"),
    (223, 226, "9 Maintenance Schedule"),
    (227, 232, "10 Emergency Procedures"),
    (233, 245, "11 Service Data"),
]

SOURCE_DOC_QUESTER = "UD Trucks QUESTER Series Owner's Manual"


def page_to_chapter(page: int) -> str:
    for start, end, name in CHAPTER_RANGES:
        if start <= page <= end:
            return name
    return None
