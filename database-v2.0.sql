CREATE TABLE "item"
(
	"id" serial NOT NULL,
	"bulk" INTEGER,
	"sku" varchar(255),
	"name" varchar(255),
	"width" varchar(255),
	"type" varchar(255),
	"color" varchar(255),
	"sales" varchar(255),
	"date" date DEFAULT NOW()
);

CREATE TABLE "sanmar"
(
	"id" serial NOT NULL,
	"ref" varchar(255) NOT NULL,
	"tracking" varchar(255) NOT NULL
);

CREATE TABLE "sanmar-prices"
(
	"id" serial NOT NULL,
	"name" varchar(255),
	"sku" varchar(255),
	"color" varchar(255),
	"size" varchar(255),
	"price" varchar(255)
);

CREATE TABLE "bc-prices"
(
	"id" serial NOT NULL,
	"name" varchar(255),
	"sku" varchar(255)
);

CREATE TABLE "user" (
"id" serial NOT NULL,
	"email" VARCHAR (320) UNIQUE NOT NULL,
	"password" varchar(255) NOT NULL,
	"join_date" DATE NOT NULL DEFAULT 'now()',
	"last_login" DATE,
	"access_level" varchar(10)
);

CREATE TABLE "no-stock"
(
	"id" serial NOT NULL,
	"name" varchar(255),
	"sku" varchar(255) DEFAULT 'NO SKU',
	"inventory_level" INTEGER,
	"level" varchar(255) DEFAULT 'Product',
	"brand" varchar(255) DEFAULT 'No Brand',
	"dead" boolean DEFAULT false,
	"date" DATE NOT NULL DEFAULT NOW(),
	"notes" varchar(50),
	"reason" varchar(255) DEFAULT 'temp'
);

CREATE TABLE "affiliate"
(
    "id" serial primary key,
    "email" varchar(255) not null,
    "order_number" VARCHAR(100),
    "order_total" VARCHAR(100),
    "qty" INT,
    "created_at" TIMESTAMP
); 

CREATE TABLE "sku"
(
    "id" serial primary key,
    "email" VARCHAR(255),
    "order_number" VARCHAR(100),
    "sku" varchar(50),
    "created_at" TIMESTAMP,
    "description" TEXT
); 

CREATE TABLE "viewed"
(
    "id" serial primary key,
    "sku" varchar(50),
    "timestamp" DATE NOT NULL DEFAULT NOW()
); 

-- DECOQUEUE

CREATE TABLE "item_queue"
(
	"id" serial NOT NULL,
	"email" varchar(320),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"order_number" varchar(255) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"product_length" TEXT,
	"product_options" TEXT,
	"qty" DECIMAL,
	"assigned" VARCHAR(255),
	"created_at" TEXT,
	"description" TEXT,
	"priority" VARCHAR(5) DEFAULT 'low',
	"need_to_run" INT;
);

CREATE TABLE "customitem"
(
	"id" serial NOT NULL,
	"email" varchar(320),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"order_number" varchar(255) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"qty" DECIMAL,
	"assigned" VARCHAR(255),
	"upload_url" TEXT,
	"comments" TEXT,
	"created_at" TEXT,
	"description" TEXT,
	"priority" VARCHAR(5) DEFAULT 'low'
);

CREATE TABLE "customerconfirm"
(
	"id" serial NOT NULL,
	"email" varchar(320),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"order_number" varchar(255) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"qty" DECIMAL,
	"assigned" VARCHAR(255),
	"upload_url1" TEXT,
	"upload_url2" TEXT,
	"upload_url3" TEXT,
	"upload_url4" TEXT,
	"upload_url5" TEXT,
	"upload_url6" TEXT,
	"upload_url7" TEXT,
	"upload_url8" TEXT,
	"upload_url9" TEXT,
	"upload_url10" TEXT,
	"upload_url11" TEXT,
	"upload_url12" TEXT,
	"upload_url13" TEXT,
	"upload_url14" TEXT,
	"upload_url15" TEXT,
	"upload_url16" TEXT,
	"upload_url17" TEXT,
	"upload_url18" TEXT,
	"upload_url19" TEXT,
	"upload_url20" TEXT,
	"comments" TEXT,
	"created_at" TEXT,
	"token" TEXT,
	"description" TEXT,
	"priority" VARCHAR(5),
	"payment_link" TEXT
);

CREATE TABLE "customerrespond"
(
	"id" serial NOT NULL,
	"email" varchar(320),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"order_number" varchar(255) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"qty" VARCHAR(10),
	"assigned" VARCHAR(255),
	"approve" VARCHAR(10),
	"comments" TEXT,
	"created_at" TEXT,
	"token" TEXT,
	"description" TEXT,
	"priority" VARCHAR(5),
	"upload_url" TEXT
);

CREATE TABLE "customerapproved"
(
	"id" serial NOT NULL,
	"email" varchar(320),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"order_number" varchar(255) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"qty" VARCHAR(10),
	"assigned" VARCHAR(255),
	"approve" VARCHAR(10),
	"comments" TEXT,
	"created_at" TEXT,
	"token" TEXT,
	"description" TEXT,
	"priority" VARCHAR(5),
	"upload_url" TEXT
);

CREATE TABLE "history"
(
	"id" serial NOT NULL,
	"email" varchar(320),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"order_number" varchar(255) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"qty" VARCHAR(10),
	"assigned" VARCHAR(255),
	"approve" VARCHAR(10),
	"admincomments" TEXT,
	"customercomments" TEXT,
	"comment_made_at" TEXT,
	"timestamp" DATE NOT NULL DEFAULT NOW()

);

CREATE TABLE "complete"
(
	"id" serial NOT NULL,
	"email" varchar(320),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"order_number" varchar(255) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"product_length" TEXT,
	"product_options" TEXT,
	"qty" DECIMAL,
	"assigned" VARCHAR(255),
	"created_at" TEXT,
	"timestamp" DATE NOT NULL DEFAULT NOW(),
	"description" TEXT,
	"priority" VARCHAR(5)
);

CREATE TABLE "customcomplete"
(
	"id" serial NOT NULL,
	"email" varchar(320),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"order_number" varchar(255) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"qty" DECIMAL,
	"assigned" VARCHAR(255),
	"upload_url1" TEXT,
	"upload_url2" TEXT,
	"upload_url3" TEXT,
	"upload_url4" TEXT,
	"upload_url5" TEXT,
	"upload_url6" TEXT,
	"upload_url7" TEXT,
	"upload_url8" TEXT,
	"upload_url9" TEXT,
	"upload_url10" TEXT,
	"upload_url11" TEXT,
	"upload_url12" TEXT,
	"upload_url13" TEXT,
	"upload_url14" TEXT,
	"upload_url15" TEXT,
	"upload_url16" TEXT,
	"upload_url17" TEXT,
	"upload_url18" TEXT,
	"upload_url19" TEXT,
	"upload_url20" TEXT,
	"comments" TEXT,
	"created_at" TEXT,
	"token" TEXT,
	"description" TEXT,
	"priority" VARCHAR(5),
	"payment_link" TEXT,
	"item_type" TEXT
);

CREATE TABLE "replies" (
	"id" serial NOT NULL,
	"reply" TEXT
);

CREATE TABLE "progress"
(
	"id" serial NOT NULL,
	"email" varchar(320),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"order_number" varchar(255) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"product_length" TEXT,
	"product_options" TEXT,
	"qty" DECIMAL,
	"assigned" VARCHAR(255),
	"created_at" TEXT,
	"description" TEXT,
	"priority" VARCHAR(5)
);