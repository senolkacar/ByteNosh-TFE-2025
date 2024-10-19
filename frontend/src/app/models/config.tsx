export default interface Config {
    name: string,
    slogan: string,
    about: string,
    popularDishes:{
        title: String,
        description: String
    },
    social: {
        facebook: string,
        twitter: string,
        instagram: string,
    },
    mobile:{
        title: String,
        description: String,
        googlePlay: String,
        appStore: String,
    },
    contact:{
        title: String,
        description: String,
        latitude: number,
        longitude: number,
        address: string,
        telephone: string,
        email: string,
    },
    aboutUs:{
        title1: String,
        description1: String,
        title2: String,
        description2: String,
        video: String,
    }

}