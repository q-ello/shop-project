export const findDuplicateQuery = `select * from comments c where lower(c.email) = ? and lower(c.name) = ? and c.product_id = ?
and lower(c.body) = ?`

export const insertQuery = `insert into comments (comment_id, email, name, body, product_id) values (?, ?, ?, ?, ?)`

export const deleteQuery = `delete from comments where comment_id = ?`

export const INSERT_PRODUCT_QUERY = 'insert into products (product_id, title, description, price) values (?, ?, ?, ?)'

export const INSERT_IMAGES_QUERY = 'insert into images (image_id, url, main, product_id) values (?, ?, ?, ?)'

export const DELETE_IMAGES_QUERY = `
  DELETE FROM images 
  WHERE image_id IN ?;
`;

export const REPLACE_PRODUCT_THUMBNAIL = `
  UPDATE images
  SET main = CASE
    WHEN image_id = ? THEN 0
    WHEN image_id = ? THEN 1
    ELSE main
END
WHERE image_id IN (?, ?);
`

export const UPDATE_PRODUCT_FIELDS = `
    UPDATE products 
    SET title = ?, description = ?, price = ? 
    WHERE product_id = ?
`

export const SELECT_RELATED_QUERY_LEFT = 'select * from related_products where product_id = ?'
export const SELECT_RELATED_QUERY_RIGHT = 'select * from related_products where related_id = ?'

export const INSERT_RELATED_QUERY = 'insert into related_products values'

export const DELETE_RELATED_QUERY = `delete from related_products where (product_id = ? or product_id in ?) and (related_id = ? or related_id in ?)`;