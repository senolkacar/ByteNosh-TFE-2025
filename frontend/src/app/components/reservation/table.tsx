const Table = ({ seats, name, isSelected, isDisabled, onSelect }: { seats: number, name: string, isReserved: boolean, isSelected: boolean, isDisabled: boolean, onSelect: () => void }) => {
    const chairStyle = `w-8 h-8 border-2 rounded-lg ${isDisabled ? 'border-gray-200' : isSelected ? 'border-green-300' : 'border-blue-400'}`;
    const tableStyle = `border-2 rounded-lg flex justify-center items-center ${isDisabled ? 'border-gray-200' : isSelected ? 'border-green-300' : 'border-blue-400'}`;

    return (
        <div className={`flex flex-col items-center space-y-1 ${isDisabled ? 'cursor-not-allowed' : 'hover:cursor-pointer'}`} onClick={onSelect}>
            <div className="flex justify-center space-x-2 mb-1">
                {/* Top chairs */}
                {[...Array(Math.ceil(seats / 2))].map((_, index) => (
                    <div className="flex flex-col items-center" key={index}>
                        <div className={`w-8 h-2 border-2 rounded-full ${isDisabled ? 'border-gray-200' : isSelected ? 'border-green-300' : 'border-blue-400'}`} />
                        <div className={chairStyle} />
                    </div>
                ))}
            </div>
            <div className={`${tableStyle} ${seats === 2 ? 'w-16 h-16' : seats === 4 ? 'w-32 h-16' : 'w-48 h-16'}`}>
                <span className={`text-blue-400 font-semibold text-center ${isDisabled ? 'text-gray-300' : ''}`}>{name}</span>
            </div>
            <div className="flex justify-center space-x-2 mt-1">
                {/* Bottom chairs */}
                {[...Array(Math.floor(seats / 2))].map((_, index) => (
                    <div className="flex flex-col items-center" key={index}>
                        <div className={chairStyle} />
                        <div className={`w-8 h-2 border-2 rounded-full ${isDisabled ? 'border-gray-200' : isSelected ? 'border-green-300' : 'border-blue-400'}`} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Table;
