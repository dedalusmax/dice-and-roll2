export const FONT_FAMILY = 'Old English Text MT'; // Harrington
export const FONT_FAMILY_BLOCK = 'Berlin Sans FB'; 

export class Styles {

    public static readonly text = {
        normal: { font: '16px ' + FONT_FAMILY, align: 'center' },
        emphasized: { font: '18px ' + FONT_FAMILY, strokeThickness: 1 },
        small: { font: '14px ' + FONT_FAMILY },
        backButton: { font: '56px ' + FONT_FAMILY, fill: '#DDDD00', align: 'center', stroke: '#000000', strokeThickness: 2 },
        characterSelectionContent: { font: '16px ' + FONT_FAMILY, align: 'center', wordWrap: true, wordWrapWidth: 240 }
    };

    public static readonly menu = {
        header: { font: '24px ' + FONT_FAMILY, fill: '#444' },
        submenu: { font: '32px ' + FONT_FAMILY, fill: '#FF6A00', align: 'center', stroke: '#000000', strokeThickness: 2 },
        volume: { font: '24px ' + FONT_FAMILY_BLOCK, fill: '#990000', align: 'center' },
        author: { font: '24px ' + FONT_FAMILY, fill: '#581B06', align: 'center' },
        author_small: { font: '18px ' + FONT_FAMILY, fill: '#581B06', align: 'center' },
        menu_button: { font: '48px ' + FONT_FAMILY, fill: '#581B06', align: 'center' },
        submenu_button: { font: '48px ' + FONT_FAMILY, fill: '#990000', align: 'center', stroke: '#000000', strokeThickness: 2 },
        menu_button_pressed: { font: '56px ' + FONT_FAMILY, fill: '#FF6A00', align: 'center', stroke: '#000000', strokeThickness: 2 }
    }

    public static readonly battle = {
        backButton: { font: '32px ' + FONT_FAMILY, fill: '#581B06', align: 'center', stroke: '#000000', strokeThickness: 2 },
        indicator: { font: '18px ' + FONT_FAMILY, fill: '#444', align: 'center' }
    }
}