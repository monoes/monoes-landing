type Org = {
  id: string;
  name: string;
  uploaderUsername: string | null;
  roleCount: number;
  topology: string | null;
  createdAt: string;
};

export function OrgGalleryPanel({ orgs }: { orgs: Org[] }) {
  const total = orgs.length;
  const byTopology = { hierarchical: 0, star: 0, mesh: 0 };
  for (const o of orgs) {
    const key = o.topology ?? "hierarchical";
    if (Object.hasOwn(byTopology, key)) byTopology[key as keyof typeof byTopology]++;
    else byTopology.hierarchical++;
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: total },
          { label: "Hierarchical", value: byTopology.hierarchical },
          { label: "Star", value: byTopology.star },
          { label: "Mesh", value: byTopology.mesh },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-ivory-linen bg-ivory-warm p-4 text-center">
            <p className="text-2xl font-semibold text-espresso">{s.value}</p>
            <p className="mt-1 text-xs text-espresso/55">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="mb-2 text-xs uppercase tracking-label text-gold-dark font-medium">All org uploads</p>
      <div className="overflow-x-auto rounded-lg border border-ivory-linen">
        <table className="w-full text-left text-sm">
          <thead className="bg-ivory-parchment text-espresso/55">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Uploader</th>
              <th className="px-4 py-2">Roles</th>
              <th className="px-4 py-2">Topology</th>
              <th className="px-4 py-2">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id} className="border-t border-ivory-linen">
                <td className="px-4 py-2 text-espresso">
                  <a href={`/community/orgs/${o.id}`} className="hover:underline">
                    {o.name}
                  </a>
                </td>
                <td className="px-4 py-2 text-espresso/70">{o.uploaderUsername ?? "—"}</td>
                <td className="px-4 py-2 text-espresso/70">{o.roleCount}</td>
                <td className="px-4 py-2 text-espresso/70">{o.topology ?? "—"}</td>
                <td className="px-4 py-2 text-espresso/55">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
