/**
 * GOLDEN ERP SYSTEM - UNIFORM INVENTORY D1 SQL HANDLER MODULE
 * File: handlers-uniform.js
 * 💡 Features: Integer NO, Strict D1 Property Mapping & Stock Value Auto-Calculations
 */

export async function getUniformData(db, body) {
  const search = String(body.searchVal || "").trim();
  let query = `SELECT * FROM uniform_ledger`;
  let params = [];

  if (search) {
    query += ` WHERE product_id LIKE ? OR product_name LIKE ? OR type LIKE ? OR size LIKE ?`;
    params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
  }

  query += ` ORDER BY id DESC LIMIT 500`;
  const rows = await db.prepare(query).bind(...params).all();
  const list = rows.results || [];

  let sellingUnit = 0;
  let currentQty = 0;
  let totalStockValue = 0;

  list.forEach(item => {
    sellingUnit += Number(item.selling_unit ?? item.sellingUnit ?? 0);
    currentQty += Number(item.current_qty ?? item.currentQty ?? 0);
    totalStockValue += Number(item.total_stock_value ?? item.totalStockValue ?? 0);
  });

  return {
    success: true,
    data: list,
    totalRows: list.length,
    stats: {
      sellingUnit,
      currentQty,
      totalStockValue,
      totalProduct: list.length
    }
  };
}

export async function saveUniformEntry(db, userSession, body) {
  const uniqueid = body.uniqueId || body.uniqueid || `UNI_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  // 💡 Integer NO Resolution
  const maxNoRow = await db.prepare("SELECT MAX(CAST(no AS INTEGER)) as max_no FROM uniform_ledger").first();
  const currentMax = maxNoRow && maxNoRow.max_no ? parseInt(maxNoRow.max_no, 10) : 0;
  const nextNo = currentMax + 1;

  const openingStock = parseFloat(body.openingStock || 0);
  const unitPrice = parseFloat(body.unitPrice || 0);
  const sellingPrice = parseFloat(body.sellingPrice || 0);
  
  const totalAmount = openingStock * unitPrice;
  const profitAmount = sellingPrice - unitPrice;
  const sellingUnit = parseFloat(body.sellingUnit || 0);
  const currentQty = openingStock - sellingUnit;
  const totalStockValue = currentQty * unitPrice;

  const stmt = `INSERT INTO uniform_ledger (
    no, product_id, product_name, type, size, opening_stock, unit_price,
    total_amount, selling_price, profit_amount, selling_unit, current_qty,
    total_stock_value, created_by, created_at, uniqueid
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  await db.prepare(stmt).bind(
    nextNo,
    body.productId || `PID ${String(nextNo).padStart(3, '0')}`,
    body.productName || '',
    body.type || '',
    body.size || '',
    openingStock,
    unitPrice,
    totalAmount,
    sellingPrice,
    profitAmount,
    sellingUnit,
    currentQty,
    totalStockValue,
    userSession?.name || 'Admin',
    new Date().toISOString(),
    uniqueid
  ).run();

  return { success: true, message: "Uniform product saved successfully", uniqueId: uniqueid };
}

export async function updateUniformEntry(db, userSession, body) {
  const uniqueid = body.uniqueId || body.uniqueid;
  if (!uniqueid) {
    return { success: false, message: "Unique ID required" };
  }

  const openingStock = parseFloat(body.openingStock || 0);
  const unitPrice = parseFloat(body.unitPrice || 0);
  const sellingPrice = parseFloat(body.sellingPrice || 0);
  const sellingUnit = parseFloat(body.sellingUnit || 0);

  const totalAmount = openingStock * unitPrice;
  const profitAmount = sellingPrice - unitPrice;
  const currentQty = openingStock - sellingUnit;
  const totalStockValue = currentQty * unitPrice;

  await db.prepare(`UPDATE uniform_ledger SET 
    product_name = ?, type = ?, size = ?, opening_stock = ?, unit_price = ?, 
    total_amount = ?, selling_price = ?, profit_amount = ?, selling_unit = ?, 
    current_qty = ?, total_stock_value = ? 
    WHERE uniqueid = ?`).bind(
    body.productName || '',
    body.type || '',
    body.size || '',
    openingStock,
    unitPrice,
    totalAmount,
    sellingPrice,
    profitAmount,
    sellingUnit,
    currentQty,
    totalStockValue,
    uniqueid
  ).run();

  return { success: true, message: "Uniform product updated successfully" };
}

export async function deleteUniformEntry(db, userSession, body) {
  const uniqueid = body.uniqueId || body.uniqueid;
  if (!uniqueid) {
    return { success: false, message: "Unique ID required" };
  }

  await db.prepare("DELETE FROM uniform_ledger WHERE uniqueid = ?").bind(uniqueid).run();
  return { success: true, message: "Uniform product deleted successfully" };
}
