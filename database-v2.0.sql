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