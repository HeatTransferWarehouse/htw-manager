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