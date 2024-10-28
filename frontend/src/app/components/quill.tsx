import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';


// Dynamically import React Quill to disable SSR
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });


const modules = {
    toolbar: [
        [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
    ],
};

const formats = [
    'header', 'font', 'list',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'color', 'background', 'align',
    'link', 'image'
];

interface QuillProps {
    value: string;
    onChange: (value: string) => void;
}

const QuillEditor: React.FC<QuillProps> = ({ value, onChange }) => {

    return (
        <div>
            <ReactQuill
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                theme="snow"
            />
        </div>
    );
};

export default QuillEditor;