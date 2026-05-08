using { com.sovanta.vibe_factory.copilot_dev_engine as db } from '../db/schema';

// NOTE: Add authorization restrictions before production deployment
@path: '/shopping'
service ShoppingService {
    entity ShoppingItems as projection on db.ShoppingItem;
}
