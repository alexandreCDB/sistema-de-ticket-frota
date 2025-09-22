//
// Arquivo: frontend/src/frota/pages/ListaVeiculosPage.tsx
//
import React, { useState, useEffect } from 'react';
import { Vehicle, getVehicles } from '../services/frota.services';
import VehicleCard from '../components/VehicleCard'; // Importa nosso novo componente

const ListaVeiculosPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true);
        const data = await getVehicles();
        setVehicles(data);
      } catch (err) {
        setError('Não foi possível carregar a lista de veículos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  if (loading) {
    // Futuramente, podemos colocar um componente de "esqueleto" mais bonito aqui
    return <div className="p-8 text-center">Carregando frota...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600 bg-red-100 rounded-md">{error}</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Frota de Veículos</h1>
        {/* Futuramente, o botão de adicionar novo veículo virá aqui */}
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-600">
          Adicionar Veículo
        </button>
      </div>

      {/* Grade responsiva para os cards de veículos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
};

export default ListaVeiculosPage;