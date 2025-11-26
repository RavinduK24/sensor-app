from contextlib import contextmanager
from typing import List, Tuple

from database import SessionLocal
from models import Property
from comfort_evaluator import ComfortEvaluator


@contextmanager
def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def get_top_properties(session, profile: str, limit: int = 3) -> List[Tuple[str, float]]:
    properties = session.query(Property).all()
    scored: List[Tuple[str, float]] = []

    for prop in properties:
        score = ComfortEvaluator.get_property_comfort_score(session, prop.id, profile)
        scored.append((prop.name, score))

    scored.sort(key=lambda item: item[1], reverse=True)
    return scored[:limit]


def main() -> None:
    profile_names = [
        "Young Professionals (Working from Home)",
        "Families with Babies/Toddlers",
        "Elderly Residents",
        "Allergy/Asthma Sufferers",
    ]

    with get_session() as session:
        for profile in profile_names:
            top = get_top_properties(session, profile)
            print(f"\nProfile: {profile}")
            for idx, (name, score) in enumerate(top, start=1):
                print(f"  {idx}. {name} — {score:.1f}")


if __name__ == "__main__":
    main()
