import Vue from 'vue';

const vm = new Vue({
  el: '#app',
  data () {
    return {
      studentNum: 1,
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
vm.studentList.push({id: 2, name: '葡萄'});
vm.studentNum = 100;
console.log(vm.studentList, '几个人');
console.log(vm.studentNum );
