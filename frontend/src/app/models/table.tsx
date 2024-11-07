export default interface TableModel {
    _id?: string;
    number: number;
    name: string;
    seats: number;
    status: "AVAILABLE" | "RESERVED" | "OCCUPIED";
    section?: string;
}