import Database from "@tauri-apps/plugin-sql";

export async function migrate(db: Database) {


  try {
    await db.execute(`
      ALTER TABLE uml_projects 
      ADD COLUMN is_deleted INTEGER DEFAULT 0
    `);
  } catch (error: any) {
    console.log("migrate:error", error.message)

  }


  try {
    console.log("Adding type column");
    await db.execute(`
      ALTER TABLE uml_projects 
      ADD COLUMN type TEXT
    `);
  } catch (error: any) {

    console.log("migrate:error", error.message)
  }


  try {
    console.log("Adding position column to uml_projects");
    await db.execute(`
      ALTER TABLE uml_projects 
      ADD COLUMN position NUMERIC(8,4) NOT NULL DEFAULT 1.0
    `);
  } catch (error: any) {
    console.log("migrate:error", error.message)
  }


  try {
    console.log("Updating categories position column type");

    await db.execute(`
      CREATE TABLE categories_new (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        position NUMERIC(8,4) NOT NULL DEFAULT 1.0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);


    await db.execute(`
      INSERT INTO categories_new 
      SELECT id, name, description, CAST(position AS NUMERIC(8,4)), created_at, updated_at 
      FROM categories
    `);


    await db.execute(`DROP TABLE categories`);


    await db.execute(`ALTER TABLE categories_new RENAME TO categories`);


    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_categories_position ON categories(position)
    `);
  } catch (error: any) {
    console.log("migrate:error", error.message)
  }
}
