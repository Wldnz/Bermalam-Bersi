-- +goose Up

    INSERT INTO category_facilities ( `name`, `description`, `created_at`, `updated_at`, `created_by`, `updated_by` )

    VALUES
    ( 'Entertainment & Communication', '',1737447823000, 1737447823000, 1, 1 );

    INSERT INTO facilities ( `id_category_facility`, `name`, `created_at`, `updated_at`, `created_by`, `updated_by` )

    VALUES ( 1, 'Television', 1737447823000, 1737447823000, 1, 1 );

-- +goose Down
DELETE FROM `facilities`;
DELETE FROM `category_facilities`;
