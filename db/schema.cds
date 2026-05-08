using { cuid, managed } from '@sap/cds/common';

namespace com.sovanta.vibe_factory.copilot_dev_engine;

entity ShoppingItem : cuid, managed {
    name     : String(255) not null;
    quantity : Decimal(10,3) not null;
    unit     : String(50) not null;
    category : String(100) not null;
}
