export const getUserById  = async(id: string) => {
    try{
        const user = await fetch('http://localhost:5000/api/auth/getUserById',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id}),
        });
    }catch (error) {
       return null;
    }
}

export const getUserByMail = async(email: string) => {
    try {
        const user = await fetch('http://localhost:5000/api/auth/getUserByMail',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email}),
        });
    } catch (error) {
        return null;
    }
}