import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FamilyMember from '@/lib/models/FamilyMember';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const member = await FamilyMember.findById(params.id);
    
    if (!member) {
      return NextResponse.json({ success: false, error: 'Anggota tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Validation
    if (!body.namaLengkap || !body.jenisKelamin) {
      return NextResponse.json(
        { success: false, error: 'Nama lengkap dan jenis kelamin wajib diisi' },
        { status: 400 }
      );
    }

    // Check if spouse has same gender (if spouse is selected)
    if (body.idPasangan && body.idPasangan !== params.id) {
      const spouse = await FamilyMember.findById(body.idPasangan);
      if (spouse && spouse.jenisKelamin === body.jenisKelamin) {
        return NextResponse.json(
          { success: false, error: 'Pasangan tidak boleh berjenis kelamin sama' },
          { status: 400 }
        );
      }
    }

    const member = await FamilyMember.findByIdAndUpdate(params.id, body, { new: true });
    
    if (!member) {
      return NextResponse.json({ success: false, error: 'Anggota tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Remove references from other members
    await FamilyMember.updateMany(
      { $or: [{ idAyah: params.id }, { idIbu: params.id }, { idPasangan: params.id }] },
      { $unset: { idAyah: '', idIbu: '', idPasangan: '' } }
    );

    const member = await FamilyMember.findByIdAndDelete(params.id);
    
    if (!member) {
      return NextResponse.json({ success: false, error: 'Anggota tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Anggota berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}