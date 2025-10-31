/* ----- User Table ----- */

CREATE TABLE "user" (
    id SERIAL,
    email character varying(320) NOT NULL UNIQUE,
    password character varying(255) NOT NULL,
    join_date date NOT NULL DEFAULT '2022-06-16'::date,
    last_login date,
    access_level character varying(10),
    default_page text DEFAULT '/'::text
);

/* ----- Supacolor Tables ----- */

CREATE TABLE supacolor_jobs (
    id SERIAL PRIMARY KEY,
    job_id integer NOT NULL UNIQUE,
    order_id integer NOT NULL UNIQUE,
    date_due character varying(320) NOT NULL,
    job_cost numeric(16,4) NOT NULL,
    expecting_artwork boolean NOT NULL,
    fake_delete boolean NOT NULL DEFAULT false,
    canceled boolean NOT NULL DEFAULT false,
    perm_delete boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    customer_name character varying(320) NOT NULL DEFAULT 'John Doe'::character varying,
    complete boolean NOT NULL DEFAULT false
);

CREATE TABLE job_line_details (
    id SERIAL,
    job_id integer REFERENCES supacolor_jobs(job_id) REFERENCES supacolor_jobs(job_id),
    customer_reference character varying(320),
    quantity integer,
    item_sku character varying(320),
    needs_artwork boolean
);

CREATE TABLE artwork_upload_response (
    id SERIAL PRIMARY KEY,
    job_id integer NOT NULL UNIQUE,
    all_artwork_uploaded boolean NOT NULL,
    all_uploads_successful boolean NOT NULL
);

CREATE TABLE artwork_uploads (
    customer_reference character varying(320) NOT NULL,
    upload_successful boolean NOT NULL,
    message character varying(320) NOT NULL,
    job_id integer REFERENCES artwork_upload_response(job_id)
);

/* ----- Queues ----- */

CREATE TABLE item_queue_updated (
    id SERIAL,
    email character varying(320),
    first_name character varying(255),
    last_name character varying(255),
    order_number character varying(255) NOT NULL,
    sku character varying(255) NOT NULL,
    product_length text,
    product_options text,
    qty numeric,
    assigned character varying(255),
    created_at text,
    description text,
    priority character varying(5) DEFAULT 'low'::character varying,
    need_to_run integer,
    in_progress boolean DEFAULT false,
    is_completed boolean DEFAULT false
);

CREATE TABLE sff_item_queue (
    id SERIAL PRIMARY KEY,
    order_number character varying(255) NOT NULL,
    sku character varying(255) NOT NULL,
    qty numeric,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    description text,
    priority character varying(5) DEFAULT 'low'::character varying,
    in_progress boolean DEFAULT false,
    is_complete boolean DEFAULT false,
    on_hold boolean DEFAULT false
);

CREATE TABLE product_options (
    id SERIAL PRIMARY KEY,
    option_name character varying(255) NOT NULL,
    option_value character varying(255) NOT NULL,
    item_queue_id integer NOT NULL REFERENCES sff_item_queue(id) ON DELETE CASCADE
);

CREATE TABLE clothing_queue (
    id SERIAL PRIMARY KEY,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    name text NOT NULL,
    sku text NOT NULL,
    qty integer NOT NULL,
    date text NOT NULL,
    is_ordered boolean DEFAULT false,
    color text DEFAULT 'NA'::text,
    size text DEFAULT 'NA'::text,
    swatch_url text,
    swatch_text_color text,
    on_hold boolean DEFAULT false,
    CONSTRAINT unique_clothing_product_entry UNIQUE (order_id, product_id, sku, qty, name, date, size, color)
);

/* ----- Picklist Tables ----- */

CREATE TABLE picklist_orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    line_items jsonb,
    shipping jsonb,
    customer jsonb,
    subtotal numeric(10,2),
    tax numeric(10,2),
    grand_total numeric(10,2),
    total_items integer,
    status text,
    is_printed boolean DEFAULT false,
    printed_time timestamp with time zone,
    shipment_number integer DEFAULT 0,
    coupon_name text,
    coupon_value numeric(10,2),
    is_split boolean DEFAULT false,
    total_shipments bigint DEFAULT 1,
    staff_notes text,
    customer_notes text
);

CREATE TABLE sff_picklist_orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id bigint NOT NULL,
    created_at timestamp with time zone,
    line_items jsonb,
    shipping jsonb,
    customer jsonb,
    subtotal numeric(10,2),
    tax numeric(10,2),
    grand_total numeric(10,2),
    total_items integer,
    status text,
    is_printed boolean DEFAULT false,
    printed_time timestamp with time zone,
    shipment_number bigint DEFAULT 0,
    coupon_name text,
    coupon_value numeric(10,2),
    is_split boolean DEFAULT false,
    total_shipments bigint DEFAULT 1,
    staff_notes text,
    customer_notes text,
    pick_list_complete boolean DEFAULT false
);

CREATE TABLE sff_deleted_order_ids (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id bigint
);

CREATE TABLE deleted_order_ids (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id bigint
);

/* ----- Product Data Tables ----- */

CREATE TABLE products_images_without_alt_htw (
    id SERIAL PRIMARY KEY,
    products_without_alt_htw_id integer REFERENCES products_without_alt_htw(id) ON DELETE CASCADE,
    alt text,
    url text
);

CREATE TABLE products_images_without_alt_sff (
    id SERIAL PRIMARY KEY,
    products_without_alt_sff_id integer REFERENCES products_without_alt_sff(id) ON DELETE CASCADE,
    alt text,
    url text
);

CREATE TABLE products_missing_descriptions (
    id SERIAL PRIMARY KEY,
    product_id integer,
    name text,
    description text,
    categories text[]
);


CREATE TABLE products_missing_descriptions_sff (
    id SERIAL PRIMARY KEY,
    product_id integer,
    name text,
    description text,
    categories text[]
);

CREATE TABLE last_product_images_sync_htw (
    id SERIAL PRIMARY KEY,
    date timestamp without time zone NOT NULL,
    is_last_sync boolean
);

CREATE TABLE last_product_images_sync_sff (
	id SERIAL PRIMARY KEY,
	date timestamp without time zone NOT NULL,
	is_last_sync boolean
);
