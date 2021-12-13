CREATE TABLE "item"
(
	"id" serial NOT NULL,
	"business" varchar(255),
	"phone" INTEGER,
	"email" varchar(255),
	"name" varchar(255),
	"location" INTEGER,
	"customerid" serial NOT NULL
);