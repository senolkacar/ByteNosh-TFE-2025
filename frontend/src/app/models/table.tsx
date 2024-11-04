export default interface TableModel {
    _id?: string;
    number: number;
    name: string;
    seats: number;
    isAvailable: boolean;
    section?: string;
}