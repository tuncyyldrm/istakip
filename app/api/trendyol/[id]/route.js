import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initDatabase } from "@/lib/schema";
import { calculateTrendyolItem } from "@/lib/calculations";

export async function PUT(request, { params }) {
  try {
    await initDatabase();
    const { id } = await params;
    const body = await request.json();

    const calculated = calculateTrendyolItem({ ...body, id });

    await db.execute({
      sql: `UPDATE trendyol_sales SET
              included = ?,
              date = ?,
              is_expense_row = ?,
              expense_title = ?,
              sale_price = ?,
              vat_rate = ?,
              commission_rate = ?,
              real_cost = ?,
              cargo_base = ?,
              cargo_vat_rate = ?,
              extra_expense = ?,
              partner_fixed = ?,
              deduction = ?,
              hakedis = ?,
              net_vat = ?,
              income_tax = ?,
              partner_total_share = ?,
              my_receivable = ?,
              my_net_profit = ?
            WHERE id = ?`,
      args: [
        calculated.included ? 1 : 0,
        calculated.date || "",
        calculated.isExpenseRow ? 1 : 0,
        calculated.expenseTitle || "",
        calculated.salePrice,
        calculated.vatRate,
        calculated.commissionRate,
        calculated.realCost,
        calculated.cargoBase,
        calculated.cargoVatRate,
        calculated.extraExpense,
        calculated.partnerFixed,
        calculated.deduction,
        calculated.hakedis,
        calculated.netVat,
        calculated.incomeTax,
        calculated.partnerTotalShare,
        calculated.myReceivable,
        calculated.myNetProfit,
        id
      ]
    });

    return NextResponse.json({ success: true, data: calculated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    await initDatabase();
    const { id } = await params;

    const res = await db.execute({ sql: "SELECT included FROM trendyol_sales WHERE id = ?;", args: [id] });
    if (!res.rows[0]) return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });

    const currentIncluded = res.rows[0].included === 1;
    const newIncluded = !currentIncluded;

    await db.execute({
      sql: "UPDATE trendyol_sales SET included = ? WHERE id = ?;",
      args: [newIncluded ? 1 : 0, id]
    });

    return NextResponse.json({ success: true, included: newIncluded });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await initDatabase();
    const { id } = await params;
    await db.execute({ sql: "DELETE FROM trendyol_sales WHERE id = ?;", args: [id] });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
