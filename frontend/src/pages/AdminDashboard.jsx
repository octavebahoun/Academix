import { useState, useEffect } from "react";
import { adminService } from "../services/adminService";
import { authService } from "../services/authService";
import {
  LayoutGrid,
  Users,
  Plus,
  Trash2,
  Power,
  LogOut,
  Search,
} from "lucide-react";

const AdminDashboard = () => {
  const [view, setView] = useState("departements");
  const [departements, setDepartements] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Formulaires
  const [newDept, setNewDept] = useState({ nom: "", code: "" });
  const [newChef, setNewChef] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    departement_id: "",
  });

  useEffect(() => {
    loadData();
  }, [view]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (view === "departements") {
        const data = await adminService.getDepartements();
        setDepartements(data.data || []);
      } else {
        const data = await adminService.getChefs();
        setChefs(data.data || []);
        const depts = await adminService.getDepartements();
        setDepartements(depts.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      await adminService.createDepartement(newDept);
      setNewDept({ nom: "", code: "" });
      loadData();
    } catch (e) {
      alert("Erreur: " + (e.response?.data?.message || "Inconnue"));
    }
  };

  const handleCreateChef = async (e) => {
    e.preventDefault();
    try {
      await adminService.createChef(newChef);
      setNewChef({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        departement_id: "",
      });
      loadData();
    } catch (e) {
      alert("Erreur: " + (e.response?.data?.message || "Inconnue"));
    }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm("Supprimer ce département ?")) return;
    try {
      await adminService.deleteDepartement(id);
      loadData();
    } catch (e) {
      alert("Erreur: " + (e.response?.data?.message || "Inconnue"));
    }
  };

  const handleDeleteChef = async (id) => {
    if (!window.confirm("Supprimer ce chef de département ?")) return;
    try {
      await adminService.deleteChef(id);
      loadData();
    } catch (e) {
      alert("Erreur: " + (e.response?.data?.message || "Inconnue"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col">
        <div className="mb-10">
          <h1 className="text-xl font-black text-indigo-500 tracking-tighter uppercase">
            AcademiX Admin
          </h1>
        </div>

        <nav className="space-y-4 flex-1">
          <button
            onClick={() => setView("departements")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === "departements" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "hover:bg-slate-800 text-slate-400"}`}
          >
            <LayoutGrid size={20} /> Départements
          </button>
          <button
            onClick={() => setView("chefs")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === "chefs" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "hover:bg-slate-800 text-slate-400"}`}
          >
            <Users size={20} /> Chefs Dépt.
          </button>
        </nav>

        <button
          onClick={() => authService.logout()}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all mt-auto"
        >
          <LogOut size={20} /> Se déconnecter
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white capitalize">{view}</h2>
            <p className="text-slate-500">
              Gérez les structures de l'université
            </p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Formulaire de création */}
          <div className="col-span-4 self-start">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Plus size={18} className="text-indigo-500" /> Ajouter{" "}
                {view === "departements" ? "un département" : "un chef"}
              </h3>

              {view === "departements" ? (
                <form onSubmit={handleCreateDept} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nom du département"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm"
                    value={newDept.nom}
                    onChange={(e) =>
                      setNewDept({ ...newDept, nom: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Code (ex: GL, MATH)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm"
                    value={newDept.code}
                    onChange={(e) =>
                      setNewDept({ ...newDept, code: e.target.value })
                    }
                    required
                  />
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-bold text-sm">
                    Créer
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCreateChef} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nom"
                      className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm"
                      value={newChef.nom}
                      onChange={(e) =>
                        setNewChef({ ...newChef, nom: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Prénom"
                      className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm"
                      value={newChef.prenom}
                      onChange={(e) =>
                        setNewChef({ ...newChef, prenom: e.target.value })
                      }
                      required
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm"
                    value={newChef.email}
                    onChange={(e) =>
                      setNewChef({ ...newChef, email: e.target.value })
                    }
                    required
                  />
                  <input
                    type="password"
                    placeholder="Mot de passe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm"
                    value={newChef.password}
                    onChange={(e) =>
                      setNewChef({ ...newChef, password: e.target.value })
                    }
                    required
                  />
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm"
                    value={newChef.departement_id}
                    onChange={(e) =>
                      setNewChef({ ...newChef, departement_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Sélectionner Département</option>
                    {departements.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nom} ({d.code})
                      </option>
                    ))}
                  </select>
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-bold text-sm">
                    Créer le chef
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Liste */}
          <div className="col-span-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold tracking-widest border-bottom border-slate-800">
                  <tr>
                    {view === "departements" ? (
                      <>
                        <th className="px-6 py-4">Code</th>
                        <th className="px-6 py-4">Nom</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4">Nom Complet</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Dépt</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-10 text-center text-slate-500 italic"
                      >
                        Chargement...
                      </td>
                    </tr>
                  ) : view === "departements" ? (
                    departements.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-10 text-center text-slate-500"
                        >
                          Aucun département
                        </td>
                      </tr>
                    ) : (
                      departements.map((d) => (
                        <tr
                          key={d.id}
                          className="hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono text-indigo-400">
                            {d.code}
                          </td>
                          <td className="px-6 py-4 font-medium text-white">
                            {d.nom}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteDept(d.id)}
                              className="text-red-500 hover:text-red-400 p-2"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    chefs.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-white font-medium">
                          {c.nom} {c.prenom}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm">
                          {c.email}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20">
                            {c.departement?.code || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() =>
                              adminService.toggleChefStatus(c.id).then(loadData)
                            }
                            className={`${c.is_active ? "text-green-500" : "text-slate-500"} p-2`}
                          >
                            <Power size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteChef(c.id)}
                            className="text-red-500 p-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
