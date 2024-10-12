export default interface Config {
    name: string,
    slogan: string,
    about: string,
    address: string,
    telephone: string,
    email: string,
    social: {
        facebook: string,
        twitter: string,
        instagram: string,
    },
    googlePlay: string,
    appStore: string,
    latitude: number,
    longitude: number,
}