import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import FamilyMember from "@/lib/models/FamilyMember";

export async function GET() {
  try {
    await dbConnect();
    const members = await FamilyMember.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: members });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validation
    if (!body.namaLengkap || !body.jenisKelamin) {
      return NextResponse.json(
        { success: false, error: "Nama lengkap dan jenis kelamin wajib diisi" },
        { status: 400 }
      );
    }

    // Check if spouse has same gender (if spouse is selected)
    if (body.idPasangan) {
      const spouse = await FamilyMember.findById(body.idPasangan);
      if (spouse && spouse.jenisKelamin === body.jenisKelamin) {
        return NextResponse.json(
          {
            success: false,
            error: "Pasangan tidak boleh berjenis kelamin sama",
          },
          { status: 400 }
        );
      }
    }

    const member = await FamilyMember.create(body);

    // Update spouse's partner field
    if (body.idPasangan) {
      await FamilyMember.findByIdAndUpdate(body.idPasangan, {
        idPasangan: member._id,
      });
    }

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
