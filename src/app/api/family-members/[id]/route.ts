import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import FamilyMember from "@/lib/models/FamilyMember";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/").pop(); // ambil ID dari URL

  try {
    await dbConnect();
    const member = await FamilyMember.findById(id);

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Anggota tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/").pop();

  try {
    await dbConnect();
    const body = await request.json();

    if (!body.namaLengkap || !body.jenisKelamin) {
      return NextResponse.json(
        { success: false, error: "Nama lengkap dan jenis kelamin wajib diisi" },
        { status: 400 }
      );
    }

    if (body.idPasangan && body.idPasangan !== id) {
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

    const member = await FamilyMember.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Anggota tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/").pop();

  try {
    await dbConnect();

    await FamilyMember.updateMany(
      { $or: [{ idAyah: id }, { idIbu: id }, { idPasangan: id }] },
      { $unset: { idAyah: "", idIbu: "", idPasangan: "" } }
    );

    const member = await FamilyMember.findByIdAndDelete(id);

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Anggota tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Anggota berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
