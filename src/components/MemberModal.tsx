'use client';

import { useState, useEffect } from 'react';
import { FamilyMember } from '@/types';
import { X, User } from 'lucide-react';

interface MemberModalProps {
  member?: FamilyMember | null;
  members: FamilyMember[];
  onSave: () => void;
  onClose: () => void;
}

export default function MemberModal({ member, members, onSave, onClose }: MemberModalProps) {
  const [formData, setFormData] = useState({
    namaLengkap: '',
    jenisKelamin: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    tanggalLahir: '',
    tanggalWafat: '',
    tempatLahir: '',
    pekerjaan: '',
    bio: '',
    fotoProfil: '',
    idAyah: '',
    idIbu: '',
    idPasangan: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setFormData({
        namaLengkap: member.namaLengkap || '',
        jenisKelamin: member.jenisKelamin || 'Laki-laki',
        tanggalLahir: member.tanggalLahir ? member.tanggalLahir.split('T')[0] : '',
        tanggalWafat: member.tanggalWafat ? member.tanggalWafat.split('T')[0] : '',
        tempatLahir: member.tempatLahir || '',
        pekerjaan: member.pekerjaan || '',
        bio: member.bio || '',
        fotoProfil: member.fotoProfil || '',
        idAyah: member.idAyah || '',
        idIbu: member.idIbu || '',
        idPasangan: member.idPasangan || ''
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = member 
        ? `/api/family-members/${member._id}`
        : '/api/family-members';
      
      const method = member ? 'PUT' : 'POST';

      // Prepare the data and convert empty strings to null for ObjectId fields
      const submitData = {
        ...formData,
        idAyah: formData.idAyah || null,
        idIbu: formData.idIbu || null,
        idPasangan: formData.idPasangan || null,
        // Convert empty date strings to null
        tanggalLahir: formData.tanggalLahir || null,
        tanggalWafat: formData.tanggalWafat || null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        onSave();
      } else {
        setError(result.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Filter available parents and spouses
  const availableFathers = members.filter(m => 
    m.jenisKelamin === 'Laki-laki' && m._id !== member?._id
  );
  const availableMothers = members.filter(m => 
    m.jenisKelamin === 'Perempuan' && m._id !== member?._id
  );
  const availableSpouses = members.filter(m => 
    m.jenisKelamin !== formData.jenisKelamin && m._id !== member?._id && !m.idPasangan
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {member ? 'Edit Anggota Keluarga' : 'Tambah Anggota Keluarga'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Lengkap */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap *
              </label>
              <input
                type="text"
                name="namaLengkap"
                value={formData.namaLengkap}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Kelamin *
              </label>
              <select
                name="jenisKelamin"
                value={formData.jenisKelamin}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Lahir
              </label>
              <input
                type="date"
                name="tanggalLahir"
                value={formData.tanggalLahir}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Tanggal Wafat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Wafat
              </label>
              <input
                type="date"
                name="tanggalWafat"
                value={formData.tanggalWafat}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Tempat Lahir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempat Lahir
              </label>
              <input
                type="text"
                name="tempatLahir"
                value={formData.tempatLahir}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Pekerjaan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pekerjaan
              </label>
              <input
                type="text"
                name="pekerjaan"
                value={formData.pekerjaan}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Foto Profil URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Foto Profil
              </label>
              <input
                type="url"
                name="fotoProfil"
                value={formData.fotoProfil}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Ayah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ayah
              </label>
              <select
                name="idAyah"
                value={formData.idAyah}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Ayah</option>
                {availableFathers.map(father => (
                  <option key={father._id} value={father._id}>
                    {father.namaLengkap}
                  </option>
                ))}
              </select>
            </div>

            {/* Ibu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ibu
              </label>
              <select
                name="idIbu"
                value={formData.idIbu}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Ibu</option>
                {availableMothers.map(mother => (
                  <option key={mother._id} value={mother._id}>
                    {mother.namaLengkap}
                  </option>
                ))}
              </select>
            </div>

            {/* Pasangan */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pasangan
              </label>
              <select
                name="idPasangan"
                value={formData.idPasangan}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Pasangan</option>
                {availableSpouses.map(spouse => (
                  <option key={spouse._id} value={spouse._id}>
                    {spouse.namaLengkap}
                  </option>
                ))}
              </select>
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografi
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : (member ? 'Update' : 'Simpan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}