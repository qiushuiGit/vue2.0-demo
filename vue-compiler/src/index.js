import Vue from 'vue';

const vm = new Vue({
  el: '#app',
  data() {
    return {
      tip: '没有做 diff 算法，通过VM修改属性，不会去更新视图',
      studentNum: 100,
      info: '搞定',
      subject: ['历史', '文化'],
      bookInfo: {
        name: '三国演义',
        author: {
          name: '罗贯中',
          age: 18
        }
      },
      studentList: [
        {
          id: 1,
          name: '小明'
        }
      ]
    }
  }
});

console.log('vm实例', vm);
vm.studentList.push({ id: 2, name: '葡萄' });
console.log(vm.studentList, '几个人');