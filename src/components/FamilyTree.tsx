"use client";

import { useState, useEffect } from "react";
import { FamilyMember } from "@/types";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { User, Heart } from "lucide-react";

interface FamilyTreeProps {
  members: FamilyMember[];
  onMemberClick: (member: FamilyMember) => void;
}

interface TreeNode {
  id: string;
  member: FamilyMember;
  spouse?: FamilyMember;
  children: TreeNode[];
  level: number;
  x?: number;
  y?: number;
}

export default function FamilyTree({
  members,
  onMemberClick,
}: FamilyTreeProps) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  useEffect(() => {
    generateTreeData();
  }, [members]);

  const generateTreeData = () => {
    if (members.length === 0) {
      setTreeData([]);
      return;
    }

    const memberMap = new Map(members.map((m) => [m._id, m]));
    const processedAsSpouse = new Set<string>();

    // Build tree recursively starting from roots (hanya garis ayah)
    const buildTree = (
      person: FamilyMember,
      level: number = 0,
      visited = new Set<string>()
    ): TreeNode | null => {
      // Prevent circular references
      if (visited.has(person._id)) {
        return null;
      }

      const newVisited = new Set(visited);
      newVisited.add(person._id);

      // Find spouse (hanya jika person adalah laki-laki atau istri dari laki-laki)
      let spouse: FamilyMember | undefined;
      if (person.jenisKelamin === "Laki-laki" && person.idPasangan) {
        spouse = memberMap.get(person.idPasangan);
      } else if (person.jenisKelamin === "Perempuan") {
        // Jika person adalah perempuan, cari suaminya
        const husband = members.find(
          (m) => m.idPasangan === person._id && m.jenisKelamin === "Laki-laki"
        );
        if (husband) {
          spouse = husband;
        }
      }

      // Mark spouse as processed to avoid duplication
      if (spouse) {
        processedAsSpouse.add(spouse._id);
      }

      // Find children - SEMUA anak (laki-laki dan perempuan)
      let children: FamilyMember[] = [];

      if (person.jenisKelamin === "Laki-laki") {
        // Jika person adalah laki-laki, ambil semua anaknya
        children = members.filter((child) => child.idAyah === person._id);
      } else if (person.jenisKelamin === "Perempuan" && spouse) {
        // Jika person adalah perempuan dan punya suami, ambil anak dari suami
        children = members.filter((child) => child.idAyah === spouse._id);
      }

      // Remove duplicates and sort by birth date
      const uniqueChildren = children
        .filter(
          (child, index, self) =>
            self.findIndex((c) => c._id === child._id) === index
        )
        .sort((a, b) => {
          if (a.tanggalLahir && b.tanggalLahir) {
            return (
              new Date(a.tanggalLahir).getTime() -
              new Date(b.tanggalLahir).getTime()
            );
          }
          return 0;
        });

      // Build child nodes recursively - HANYA anak laki-laki yang melanjutkan garis keturunan
      const childNodes = uniqueChildren
        .map((child) => {
          if (child.jenisKelamin === "Laki-laki") {
            // Anak laki-laki: lanjutkan garis keturunan
            return buildTree(child, level + 1, newVisited);
          } else {
            // Anak perempuan: tampilkan tapi tidak lanjutkan garis keturunan
            return {
              id: child._id,
              member: child,
              spouse: child.idPasangan
                ? memberMap.get(child.idPasangan)
                : undefined,
              children: [], // Tidak ada anak karena tidak melanjutkan garis ayah
              level: level + 1,
            };
          }
        })
        .filter((node) => node !== null) as TreeNode[];

      return {
        id: person._id,
        member: person,
        spouse,
        children: childNodes,
        level,
      };
    };

    // Find root members - hanya laki-laki yang tidak punya ayah dalam dataset
    const rootMembers = members.filter((member) => {
      const hasParentInDataset = members.some(
        (p) => p._id !== member._id && member.idAyah === p._id
      );
      return !hasParentInDataset && member.jenisKelamin === "Laki-laki";
    });

    // Sort roots by birth date (oldest first)
    const sortedRoots = rootMembers.sort((a, b) => {
      if (a.tanggalLahir && b.tanggalLahir) {
        return (
          new Date(a.tanggalLahir).getTime() -
          new Date(b.tanggalLahir).getTime()
        );
      }
      return 0;
    });

    // Build trees from roots, excluding those already processed as spouses
    const trees = sortedRoots
      .filter((member) => !processedAsSpouse.has(member._id))
      .map((member) => buildTree(member, 0))
      .filter((tree) => tree !== null) as TreeNode[];

    setTreeData(trees);
  };

  const renderMemberCard = (
    member: FamilyMember,
    isSpouse: boolean = false
  ) => {
    return (
      <div
        onClick={() => onMemberClick(member)}
        className="flex flex-col items-center cursor-pointer group relative text-black"
      >
        <div
          className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all duration-200 ${
            member.jenisKelamin === "Laki-laki"
              ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-300 hover:from-blue-600 hover:to-blue-700"
              : "bg-gradient-to-br from-pink-500 to-pink-600 border-pink-300 hover:from-pink-600 hover:to-pink-700"
          } group-hover:scale-105 group-hover:shadow-xl`}
        >
          {member.fotoProfil ? (
            <img
              src={member.fotoProfil}
              alt={member.namaLengkap}
              className="w-full h-full rounded-full object-cover border-2 border-white"
            />
          ) : (
            <User className="h-8 w-8" />
          )}
        </div>
        <div className="mt-3 text-center max-w-24">
          <p className="text-sm font-semibold text-gray-900 leading-tight">
            {member.namaLengkap.length > 12
              ? member.namaLengkap.substring(0, 12) + "..."
              : member.namaLengkap}
          </p>
          {member.tanggalLahir && (
            <p className="text-xs text-gray-600 leading-tight mt-1">
              {new Date(member.tanggalLahir).getFullYear()}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderNode = (node: TreeNode): React.ReactElement => {
    const hasSpouse = !!node.spouse;
    const hasChildren = node.children.length > 0;
    const childrenCount = node.children.length;

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Parent(s) Level */}
        <div className="flex items-center justify-center relative">
          {/* Main Member */}
          {renderMemberCard(node.member)}

          {/* Marriage Connection */}
          {hasSpouse && (
            <>
              <div className="mx-4 flex items-center">
                <div className="w-6 h-1 bg-gradient-to-r from-red-400 to-red-500 rounded-full"></div>
                <Heart className="h-5 w-5 text-red-500 mx-2 drop-shadow-sm animate-pulse" />
                <div className="w-6 h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-full"></div>
              </div>
              {renderMemberCard(node.spouse!, true)}
            </>
          )}
        </div>

        {/* Children Section */}
        {hasChildren && (
          <div className="relative mt-12">
            {/* Vertical line from parent(s) down */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-1 h-12 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full"></div>

            {/* Horizontal connecting line for multiple children */}
            {childrenCount > 1 && (
              <div
                className="absolute top-0 h-1 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 rounded-full"
                style={{
                  left: `${(100 / childrenCount) * 0.5}%`,
                  right: `${(100 / childrenCount) * 0.5}%`,
                  transform: "translateY(-0.125rem)",
                }}
              />
            )}

            {/* Children Grid with improved spacing */}
            <div
              className="flex justify-center items-start"
              style={{
                gap: `${Math.max(140, 200 - childrenCount * 20)}px`,
              }}
            >
              {node.children.map((child, index) => (
                <div
                  key={child.id}
                  className="relative flex flex-col items-center"
                >
                  {/* Vertical line to each child with improved styling */}
                  <div className="absolute -top-0 left-1/2 transform -translate-x-1/2 w-1 h-12 bg-gradient-to-b from-gray-600 to-gray-400 rounded-full"></div>

                  {/* Connection point */}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-600 rounded-full border-2 border-white shadow-md"></div>

                  {/* Child Node with padding */}
                  <div className="pt-8">{renderNode(child)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (treeData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center border border-gray-200">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <User className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          Belum ada data keluarga
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Tambahkan anggota keluarga laki-laki untuk memulai pohon silsilah
          garis ayah
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="h-[900px] relative bg-gradient-to-br from-blue-50/40 via-indigo-50/30 to-purple-50/40">
        <TransformWrapper
          initialScale={0.7}
          minScale={0.2}
          maxScale={4}
          centerOnInit={true}
          limitToBounds={false}
          doubleClick={{
            disabled: false,
            mode: "zoomIn",
            step: 0.7,
          }}
          wheel={{
            step: 0.1,
            smoothStep: 0.008,
          }}
          panning={{
            disabled: false,
            velocityDisabled: false,
          }}
        >
          <TransformComponent>
            <div className="p-24 min-w-max min-h-max">
              <div className="flex justify-center items-start gap-40">
                {treeData.map((rootNode, index) => (
                  <div key={rootNode.id} className="flex flex-col items-center">
                    {/* Root Family Label with improved styling */}
                    {treeData.length > 1 && (
                      <div className="mb-8 px-6 py-3 bg-white rounded-full shadow-lg border-2 border-gray-200">
                        <p className="text-sm font-semibold text-gray-700">
                          Garis Ayah {index + 1}
                        </p>
                      </div>
                    )}
                    <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/60">
                      {renderNode(rootNode)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
}
