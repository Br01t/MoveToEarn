
import React from 'react';
import { Lock } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
        <Lock className="text-emerald-400" /> Privacy Policy
      </h1>

      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-gray-300 space-y-4">
        <p>Last updated: 2025-01-01</p>
        
        <h3 className="text-xl font-bold text-white mt-6">1. Data Collection</h3>
        <p>
            We collect location data only when you explicitly invoke the "Sync Run" feature. 
            This data is used to verify game mechanics (zone creation and conquest). 
            We do not track your location in the background.
        </p>

        <h3 className="text-xl font-bold text-white mt-6">2. User Accounts</h3>
        <p>
            Your profile is public within the game ecosystem. Your username, avatar, and owned zones are visible to other players on the map.
        </p>

        <h3 className="text-xl font-bold text-white mt-6">3. Blockchain Data</h3>
        <p>
            If you connect a Web3 wallet, your public address will be associated with your game account. 
            Transaction history related to RUN and GOV tokens is public on the blockchain.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
