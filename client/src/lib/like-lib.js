import { ref } from 'vue';
const like = ref(0);
const changeLike = (num = 1)=>like.value+=num;

export {
    like,
    changeLike
}