import {Mashup, TD} from '@/lib/classes';

export default{
    namespaced: true,
    state: {
        // ===== STATIC STORE STATE ===== //
        // ===== DYNAMIC STORE STATE ===== //
        currentMashup : Mashup,
    },

    getters: {
        getCurrentMashup(state): Mashup {
            return state.currentMashup;
        }
    },

    mutations: {
        setCurrentMashup(state: any, mashup: Mashup) {
            state.currentMashup = mashup;
        }
    }
};
