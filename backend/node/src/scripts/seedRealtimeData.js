/**
 * @file seedRealtimeData.js
 * @description Seed MongoDB pour le module temps réel (Node only).
 * Crée des sessions, participants (avec rôles), messages, notifications et état whiteboard.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const SessionCollaborative = require('../models/SessionCollaborative');
const SessionParticipant = require('../models/SessionParticipant');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const OnlineUser = require('../models/OnlineUser');
const SessionEvent = require('../models/SessionEvent');

const seedUsers = [
    { id: 1, nom: 'Dupont', prenom: 'Jean', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jean' },
    { id: 2, nom: 'Martin', prenom: 'Sophie', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie' },
    { id: 3, nom: 'Diallo', prenom: 'Awa', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Awa' },
    { id: 4, nom: 'Bernard', prenom: 'Lucas', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas' }
];

const toFutureDate = (minutes) => new Date(Date.now() + minutes * 60 * 1000);

const run = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI manquant dans le .env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    const shouldReset = process.argv.includes('--reset');

    if (shouldReset) {
        await Promise.all([
            SessionCollaborative.deleteMany({}),
            SessionParticipant.deleteMany({}),
            ChatRoom.deleteMany({}),
            Message.deleteMany({}),
            Notification.deleteMany({}),
            OnlineUser.deleteMany({}),
            SessionEvent.deleteMany({})
        ]);
        console.log('🧹 Collections temps réel nettoyées');
    }

    const session = await SessionCollaborative.create({
        organisateur_id: seedUsers[0].id,
        matiere_id: 12,
        titre: 'Session Révision Algo - Arbres',
        description: 'Révision collaborative avec tableau blanc et partage de fichiers',
        duree_minutes: 90,
        date_debut: toFutureDate(30),
        date_fin: toFutureDate(120),
        format: 'chat',
        nb_max_participants: 15,
        organisateur_info: seedUsers[0],
        matiere_nom: 'Algorithmique',
        niveau_requis: 'intermediaire',
        statut: 'en_cours',
        room_id: `session_${new mongoose.Types.ObjectId()}`,
        whiteboard_state: [
            {
                action: 'draw',
                user_id: 1,
                data: { points: [{ x: 100, y: 100 }, { x: 180, y: 160 }], color: '#111827', size: 3 },
                created_at: new Date()
            }
        ],
        whiteboard_updated_at: new Date()
    });

    const chatRoom = await ChatRoom.create({
        session_id: session._id,
        room_name: session.titre,
        active_users: [],
        is_active: true,
        last_activity: new Date()
    });

    await SessionParticipant.insertMany([
        {
            session_id: session._id,
            user_id: seedUsers[0].id,
            user_info: seedUsers[0],
            role: 'moderateur',
            statut: 'present',
            joined_at: new Date()
        },
        {
            session_id: session._id,
            user_id: seedUsers[1].id,
            user_info: seedUsers[1],
            role: 'participant',
            statut: 'present',
            joined_at: new Date()
        },
        {
            session_id: session._id,
            user_id: seedUsers[2].id,
            user_info: seedUsers[2],
            role: 'participant',
            statut: 'present',
            joined_at: new Date()
        },
        {
            session_id: session._id,
            user_id: seedUsers[3].id,
            user_info: seedUsers[3],
            role: 'moderateur',
            statut: 'present',
            joined_at: new Date()
        }
    ]);

    await Message.insertMany([
        {
            chat_room_id: chatRoom._id,
            session_id: session._id,
            user_id: 1,
            user_info: seedUsers[0],
            type: 'system',
            contenu: 'Bienvenue dans la session de révision !'
        },
        {
            chat_room_id: chatRoom._id,
            session_id: session._id,
            user_id: 2,
            user_info: seedUsers[1],
            type: 'text',
            contenu: 'Salut @Jean, on peut revoir les AVL ? @mod',
            mentions: [1, 4],
            mentions_meta: [
                { user_id: 1, nom: 'Dupont', prenom: 'Jean', role: 'moderateur' },
                { user_id: 4, nom: 'Bernard', prenom: 'Lucas', role: 'moderateur' }
            ]
        },
        {
            chat_room_id: chatRoom._id,
            session_id: session._id,
            user_id: 3,
            user_info: seedUsers[2],
            type: 'file',
            contenu: 'Fichier partagé: fiche-avl.pdf',
            file_url: 'http://localhost:3001/uploads/chat/demo-fiche-avl.pdf',
            file_meta: {
                name: 'fiche-avl.pdf',
                mime: 'application/pdf',
                size: 120340,
                extension: 'pdf',
                storage: 'local'
            }
        }
    ]);

    await Notification.insertMany([
        {
            user_id: 1,
            type: 'mention',
            titre: 'Vous avez été mentionné',
            message: 'Sophie vous a mentionné dans la session Révision Algo',
            is_read: false,
            data: { session_id: session._id }
        },
        {
            user_id: 4,
            type: 'mention',
            titre: 'Vous avez été mentionné',
            message: 'Sophie a mentionné les modérateurs',
            is_read: false,
            data: { session_id: session._id }
        }
    ]);

    await SessionEvent.insertMany([
        {
            session_id: session._id,
            user_id: 1,
            user_info: seedUsers[0],
            event_type: 'joined'
        },
        {
            session_id: session._id,
            user_id: 2,
            user_info: seedUsers[1],
            event_type: 'joined'
        }
    ]);

    console.log('🌱 Seed temps réel terminé');
    console.log(`Session créée: ${session._id}`);
    console.log('Participants: 4 | Messages: 3 | Notifications: 2');

    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
};

run().catch(async (error) => {
    console.error('❌ Erreur seed:', error.message);
    try {
        await mongoose.disconnect();
    } catch (disconnectError) {
        // no-op
    }
    process.exit(1);
});
