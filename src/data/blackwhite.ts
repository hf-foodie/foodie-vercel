import {TListFilterOptions} from "@/data/types";

export async function getBlackWhiteListFilterOptions(): Promise<TListFilterOptions> {
    return [
        {
            label: '시즌',
            name: 'season',
            tabUIType: 'checkbox',
            options: [
                {
                    name: '시즌 1',
                    value: '1',
                    defaultChecked: true,
                },
                {
                    name: '시즌 2',
                    value: '2',
                    defaultChecked: true,
                }
            ],
        },
        {
            label: '수저',
            name: 'spoonClass',
            tabUIType: 'checkbox',
            options: [
                {
                    name: '백수저',
                    value: '백수저',
                    defaultChecked: true,
                },
                {
                    name: '흑수저',
                    value: '흑수저',
                    defaultChecked: true,
                },
                {
                    name: '심사위원',
                    value: '심사위원',
                    defaultChecked: true,
                }
            ],
        },
    ]
}