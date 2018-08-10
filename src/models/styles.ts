export const FONT_FAMILY = 'Berkshire Swash'; // alternatives: Handlee, Kaushan Script

export class Styles {

    public static readonly text = {
        normal: { font: '16px ' + FONT_FAMILY, align: 'center' },
        emphasized: { font: '18px ' + FONT_FAMILY, strokeThickness: 1 },
        small: { font: '14px ' + FONT_FAMILY },
        backButton: { font: '56px ' + FONT_FAMILY, fill: '#DDDD00', align: 'center', stroke: '#000000', strokeThickness: 2 },
        characterSelectionContent: { font: '16px ' + FONT_FAMILY, align: 'center', wordWrap: true, wordWrapWidth: 240 }
    };

    public static readonly menu = {
        header: { font: '24px ' + FONT_FAMILY, fill: '#444', strokeThickness: 1 },
        submenu: { font: '32px ' + FONT_FAMILY, fill: '#FF6A00', align: 'center', stroke: '#000000', strokeThickness: 2 },
        volume: { font: '32px ' + FONT_FAMILY, fill: '#990000', align: 'center' },
        author: { font: '24px ' + FONT_FAMILY, fill: '#FF6A00', align: 'center' },
        author_small: { font: '18px ' + FONT_FAMILY, strokeThickness: 1, fill: '#777' },
        menu_button: { font: '64px ' + FONT_FAMILY, fill: '#990000', align: 'center', stroke: '#000000', strokeThickness: 2 },
        submenu_button: { font: '48px ' + FONT_FAMILY, fill: '#990000', align: 'center', stroke: '#000000', strokeThickness: 2 },
        menu_button_pressed: { font: '56px ' + FONT_FAMILY, fill: '#FF6A00', align: 'center', stroke: '#000000', strokeThickness: 2 }
    }

    public static readonly battle = {
        round: { font: '72px ' + FONT_FAMILY, fill: '#990000', align: 'center' }
    }
}