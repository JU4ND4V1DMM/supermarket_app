import math
from sqlalchemy.orm import Query


def paginate(query: Query, page: int = 1, page_size: int = 10) -> dict:
    """Generic pagination helper for SQLAlchemy queries."""
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if total > 0 else 1,
    }
