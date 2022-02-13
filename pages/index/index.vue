<template>
	<view>
		<view class="search">
			<u-search placeholder="搜索前后端博客" v-model="keyword" :clearabled="true" @focus="goSearch"/>
		</view>
		<wz-sticky bgColor="#fff" stickyTop="0">
			<view class="cate">
				<u-tabs :list="list1" @click="switchClass" />
			</view>
			<wz-tab class="tab-xxx" :list="activitieList" :defaultChoseInd="100" :isUseOpenList="false"
				defaultChoseItem="推荐" @onValueChange="selectCate" v-if="isShowSubClass" />
		</wz-sticky>
		<wz-article :posts="blogData"></wz-article>
		<view class="loadStyle" v-if="!isEnd && !loading">下拉加载</view>
		<view class="loadStyle" v-if="!isEnd && loading">正在加载中</view>
		<view class="loadStyle" v-if="isEnd">我也是有底线的~</view>
		<view class="cu-tabbar-height"></view>
	</view>
</template>

<script>
	import {
		getHotBlog,
		getBlogByLevel
	} from "../../api/index";
	import {
		getArticleByBlogSortUid,
		getBlogSortList
	} from "../../api/classify.js";
	import wzTab from '@/components/wz-tab/wz-tab.vue';
	export default {
		components: {
			'wz-tab': wzTab
		},
		props: {
			isRefresh: {
				type: String,
				default: "blogHome"
			}
		},
		data() {
			return {
				keyword: "",
				blogData: [],
				isEnd: false,
				loading: false,
				total: 0,
				currentPage: 1,
				pageSize: 20,
				dotStyle: false,
				activitieList: [], // 所有分类
				cardCur: 0,
				isCard: false,
				keyword: '',
				list1: [{
						name: '热门',
					}, {
						name: '前端',
					},
					{
						name: '后端',
					}
				],
				itemByDate: [],
				marginTop: 0,
				isShowSubClass: false
			};
		},
		watch: {
			isRefresh: {
				deep: true,
				handler(newValue, oldValue) {
					this.newBlogData = []
					this.getRecommendBlog()
					this.getLevelBlog()
				}
			}
		},
		created() {
			this.getRecommendBlog()
			this.getLevelBlog()
		},
		methods: {
			searcBlog() {
				console.log("搜索博客");
				if (this.keyword == "") {
					uni.showToast({
						icon: "none",
						title: "搜索内容不能为空",
					})
					return;
				}
				uni.navigateTo({
					url: '/pages/search/home?keyword=' + this.keyword,
				});
			},
			switchClass(index) {
				this.blogSortList(index)
			},
			blogSortList(e) {
				var that = this
				if (e.index === 0) {
					this.isShowSubClass = false
					this.getRecommendBlog()
				} else {
					getBlogSortList().then(res => {
						if (res.code == this.$ECode.SUCCESS) {
							var activities = res.data
							var activities = activities.filter(function(i) {
								return i.content == e.index;
							});
							this.isShowSubClass = true
							that.activitieList = activities
							that.getBlogList(that.activitieList[0].uid)
						}
					})
				}
			},
			checkCate(index) {
				return index == 1;
			},
			selectCate(e) {
				this.getBlogList(e.currentItem.uid);
			},

			goInfo(uid) {
				uni.navigateTo({
					url: '/pages/detail/detail?uid=' + uid
				});
			},
			goSearch() {
				uni.navigateTo({
					url: '/pages/search/search'
				});
			},
			cardSwiper(e) {
				this.cardCur = e.detail.current
			},
			loadData: function() {
				console.log("上拉加载数据", this.newBlogData.length, this.total)
				if (this.newBlogData.length >= this.total) {
					return;
				}
				this.currentPage = this.currentPage + 1;
				this.getBlogList();
			},
			getLevelBlog() {
				var that = this
				let params = {}
				params.level = 1;
				params.useSort = 1;
				getBlogByLevel(params).then(res => {
					if (res.code == this.$ECode.SUCCESS) {
						that.fristData = res.data.records;
					}
				})
			},
			getRecommendBlog() {
				var that = this
				let params = {}
				params.currentPage = that.currentPage;
				params.pageSize = that.pageSize;
				that.loading = true;
				getHotBlog(params).then(res => {
					if (res.code == this.$ECode.SUCCESS) {
						var newData = that.blogData.concat(res.data.records);
						that.blogData = newData;
						that.total = res.data.total;
						that.currentPage = res.data.current;
						that.pageSize = res.data.size;
					}
					if (that.blogData.length >= that.total) {
						that.isEnd = true;
					} else {
						that.isEnd = false;
					}
					that.loading = false;
				})
			},
			getBlogList(blogSortUid) {
				this.selectBlogSortUid = blogSortUid;
				var params = {};
				params.currentPage = this.currentPage;
				params.pageSize = this.pageSize;
				params.blogSortUid = blogSortUid
				this.loading = true;
				getArticleByBlogSortUid(params).then(response => {
					console.log("通过分类uid获取文章列表", response)
					if (response.code == this.$ECode.SUCCESS) {
						this.blogData = response.data.records;
						this.currentPage = response.data.current;
						this.pageSize = response.data.size;
						this.total = response.data.total;
					}
					if (this.blogData.length >= this.total) {
						this.isEnd = true;
					} else {
						this.isEnd = false;
					}
					this.loading = false;
				});
			},
		}
	}
</script>

<style lang="less" scoped>
	page {
		background-color: #f1f3f8;
		height: 100vh;
	}

	.search {
		padding: 40rpx 20rpx 0rpx 20rpx;
		background-color: #ffffff;
	}

	.cate {
		background-color: #ffffff;
		border-bottom: solid 1px #f1f3f8;
	}


	.loadStyle {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		color: #999999;
		font-size: 30rpx;
	}
	
	.resulut {
		padding: 100rpx 0rpx;
	}
</style>
