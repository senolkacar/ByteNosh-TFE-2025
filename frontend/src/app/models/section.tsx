import TableModel from "@/app/models/table";

export default interface SectionModel {
    _id: string;
    name: string;
    description: string;
    isIndoor: boolean;
    tables: TableModel[];
}