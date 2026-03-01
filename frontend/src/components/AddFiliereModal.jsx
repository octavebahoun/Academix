export default function AddFiliereModal({ open, onClose, onAdd }) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-(--card-bg) rounded-xl shadow-lg p-8 w-full max-w-md"
      >
        <div className="font-bold text-lg mb-4">
          Ajouter une nouvelle filière
        </div>
        <form onSubmit={onAdd}>
          <input
            type="text"
            placeholder="Nom de la filière"
            className="w-full mb-4 p-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Nombre d'années"
            className="w-full mb-4 p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full py-2 bg-green-500 text-white rounded font-semibold"
          >
            Ajouter
          </button>
        </form>
        <button className="mt-4 text-red-500 font-semibold" onClick={onClose}>
          Annuler
        </button>
      </motion.div>
    </motion.div>
  );
}
