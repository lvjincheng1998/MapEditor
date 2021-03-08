export default class ResConfig {

    static movieBody: Record<number, MovieBodyResConfig> = {
        1: {
            id: 1,
            prefix: "clothes1001",
            gender: 1,
            type: 1
        },
        2: {
            id: 2,
            prefix: "clothes1002",
            gender: 2,
            type: 1
        }
    }

    static movieMonster: Record<number, MovieBodyResConfig> = {
        1: {
            id: 1,
            prefix: "pet1002",
            gender: 1,
            type: 1
        },
        2: {
            id: 2,
            prefix: "pet1008",
            gender: 1,
            type: 1
        },
        3: {
            id: 3,
            prefix: "pet1009",
            gender: 1,
            type: 1
        }
    }

    static movieWeapon: Record<number, MovieWeaponResConfig> = {
        300: {
            id: 300,
            prefix: "weapon005",
            type: 1
        },
        301: {
            id: 301,
            prefix: "weapon301",
            type: 1
        },
        302: {
            id: 302,
            prefix: "weapon302",
            type: 1
        },
        303: {
            id: 303,
            prefix: "weapon303",
            type: 1
        },
        304: {
            id: 304,
            prefix: "weapon304",
            type: 1
        },
        305: {
            id: 305,
            prefix: "weapon305",
            type: 1
        },
        306: {
            id: 306,
            prefix: "weapon306",
            type: 1
        },
        307: {
            id: 307,
            prefix: "weapon307",
            type: 1
        },
        308: {
            id: 308,
            prefix: "weapon308",
            type: 1
        },
        309: {
            id: 309,
            prefix: "weapon309",
            type: 1
        },
        310: {
            id: 310,
            prefix: "weapon310",
            type: 1
        }
    }

    static movieHorse: Record<number, MovieHorseResConfig> = {
        1: {
            id: 1,
            body: {zIndex: 0},
            head3: {zIndex: 20},
            offset: [0, -30]
        },
        2: {
            id: 2,
            body: {zIndex: 0},
            head3: {zIndex: 20},
            offset: [5, -20]
        },
        3: {
            id: 3,
            body: {zIndex: 0},
            head3: {zIndex: 20},
            offset: [0, 0]
        },
        5: {
            id: 5,
            body: {zIndex: 0},
            head3: {zIndex: 20},
            offset: [0, 0]
        },
        6: {
            id: 6,
            body: {zIndex: 0},
            head3: {zIndex: 20},
            offset: [0, -10]
        },
        7: {
            id: 7,
            body: {zIndex: 0},
            head3: {zIndex: 20},
            offset: [0, 0]
        },
        8: {
            id: 8,
            body: {zIndex: 0},
            head3: {zIndex: 20},
            offset: [0, -20]
        },
        9: {
            id: 9,
            body: {zIndex: 0},
            head1: {zIndex: 20},
            offset: [0, 10]
        },
        10: {
            id: 10,
            body: {zIndex: 0},
            offset: [-7, -7]
        },
        12: {
            id: 12,
            body: {zIndex: 0},
            offset: [0, -15]
        },
        13: {
            id: 13,
            body: {zIndex: 0},
            offset: [0, -10]
        },
        14: {
            id: 14,
            body: {zIndex: 0},
            offset: [0, -5]
        },
        15: {
            id: 15,
            body: {zIndex: 0},
            head1: {zIndex: 20},
            head3: {zIndex: 20},
            offset: [0, 0]
        },
        16: {
            id: 16,
            body: {zIndex: 0},
            offset: [0, 30]
        },
        17: {
            id: 17,
            body: {zIndex: 0},
            head1: {zIndex: 20},
            head3: {zIndex: 20},
            offset: [0, 0]
        },
        18: {
            id: 18,
            body: {zIndex: 0},
            offset: [60, -5, 50, -30]
        },
        21: {
            id: 21,
            body: {zIndex: 0},
            offset: [60, 0, 35, -10]
        },
        23: {
            id: 23,
            body: {zIndex: 0},
            head3: {zIndex: 20},
            offset: [0, 0]
        }
    }

    static movieSkill: Record<number, MovieSkillResConfig> = {
        1: {
            id: 1,
            res: [
                {name: "skill1001", direction: 0, offset: [0, 0, 1]},
                {name: "skill1001", direction: 2, offset: [0, 0]},
            ]
        },
        2: {
            id: 2,
            res: [
                {name: "skill1002", direction: 0, offset: [-50, 50]},
                {name: "skill1002_1", direction: 3, offset: [50, 0]}
            ]
        },
        3: {
            id: 3,
            res: [
                {name: "skill1003", direction: 0, offset: [0, 0]},
                {name: "skill1003", direction: 2, offset: [0, 0]}
            ]
        },
        4: {
            id: 4,
            res: [
                {name: "skill2001", direction: 0, offset: [-150, 150]},
                {name: "skill2001", direction: 2, offset: [-150, 150]},
            ]
        },
        5: {
            id: 5,
            res: [
                {name: "skill2002", direction: 0, offset: [-150, 0]},
                {name: "skill2002", direction: 2, offset: [-150, 0]}
            ]
        },
        6: {
            id: 6,
            res: [
                {name: "skill2003", direction: 0, offset: [0, 0]},
                {name: "skill2003", direction: 2, offset: [0, 0]}
            ]
        },
        7: {
            id: 7,
            res: [
                {name: "skill3001", direction: 0, offset: [0, 0, 1]},
                {name: "skill3001", direction: 2, offset: [0, 0]},
            ]
        },
        8: {
            id: 8,
            res: [
                {name: "skill3002", direction: 1, offset: [200, 150, 1], rotate: -90},
                {name: "skill3002", direction: 3, offset: [200, 150], rotate: -90}
            ]
        },
        9: {
            id: 9,
            res: [
                {name: "skill3003", direction: 0, offset: [0, 0]},
                {name: "skill3003", direction: 2, offset: [0, 0]}
            ]
        },
        10: {
            id: 10,
            res: [
                {name: "skill4001", direction: 0, offset: [-50, 30]},
                {name: "skill4001_1", direction: 2, offset: [-50, 30]},
            ]
        },
        11: {
            id: 11,
            res: [
                {name: "skill4002", direction: 0, offset: [-200, 0]},
                {name: "skill4002", direction: 2, offset: [-200, 0]}
            ]
        },
        12: {
            id: 12,
            res: [
                {name: "skill4003", direction: 0, offset: [0, 0]},
                {name: "skill4003", direction: 2, offset: [0, 0]}
            ]
        }
    }

    static weaponShaderInfos: Record<string, WeaponShaderInfo> = {
        "300": {
            "id": 300,
            "scanRadius": 0.05,
            "glowColor": [
                155,
                225,
                255,
                1
            ]
        },
        "301": {
            "id": 301,
            "scanRadius": 0.05,
            "glowColor": [
                155,
                255,
                225,
                1
            ]
        },
        "302": {
            "id": 302,
            "scanRadius": 0.05,
            "glowColor": [
                255,
                195,
                135,
                1
            ]
        },
        "303": {
            "id": 303,
            "scanRadius": 0.05,
            "glowColor": [
                125,
                235,
                255,
                1
            ]
        },
        "304": {
            "id": 304,
            "scanRadius": 0.05,
            "glowColor": [
                115,
                175,
                255,
                1
            ]
        },
        "305": {
            "id": 305,
            "scanRadius": 0.05,
            "glowColor": [
                165,
                165,
                165,
                1
            ]
        },
        "306": {
            "id": 306,
            "scanRadius": 0.05,
            "glowColor": [
                160,
                155,
                95,
                1
            ]
        },
        "307": {
            "id": 307,
            "scanRadius": 0.05,
            "glowColor": [
                75,
                125,
                165,
                1
            ]
        },
        "308": {
            "id": 308,
            "scanRadius": 0.05,
            "glowColor": [
                255,
                145,
                95,
                1
            ]
        },
        "309": {
            "id": 309,
            "scanRadius": 0.05,
            "glowColor": [
                225,
                135,
                255,
                1
            ]
        },
        "310": {
            "id": 310,
            "scanRadius": 0.05,
            "glowColor": [
                105,
                35,
                255,
                1
            ]
        }
    }
}

declare global {
    interface MovieBodyResConfig {
        id: number;
        prefix: string;
        gender: number;
        /**装扮类型 1：普通；2：时装； */
        type: number;
    }
    interface MovieWeaponResConfig {
        id: number;
        prefix: string;
        /**装扮类型 1：普通；2：时装； */
        type: number;
    }
    interface MovieHorseResConfig {
        id: number;
        body: {zIndex: number};
        head1?: {zIndex: number};
        head3?: {zIndex: number};
        offset: number[];
    }
    interface MovieSkillResConfig {
        id: number;
        res: MovieSkillResInfo[];
    }
    interface MovieSkillResInfo {
        name: string;
        direction: number;
        offset: number[];
        rotate?: number;
    }
    interface WeaponShaderInfo {
        id: number;
        scanRadius: number,
        glowColor: number[];
    }
}