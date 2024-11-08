export default interface Config {
    name: string,
    slogan: string,
    about: string,
    popularDishes:{
        title: string,
        description: string
    },
    social: {
        facebook: string,
        twitter: string,
        instagram: string,
    },
    mobile:{
        title: string,
        description: string,
        googlePlay: string,
        appStore: string,
    },
    contact:{
        title: string,
        description: string,
        address: string,
        telephone: string,
        email: string,
        latitude: number,
        longitude: number,
    },
    aboutUs:{
        title1: string,
        description1: string,
        title2: string,
        description2: string,
        video: string,
    }

}