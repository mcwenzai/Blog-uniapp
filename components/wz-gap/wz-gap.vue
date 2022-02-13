<template>
	<view class="u-gap" :style="[gapStyle]"></view>
</template>

<script>
	import props from './props.js';
	export default {
		name: "wz-gap",
		mixins: [uni.$u.mpMixin, uni.$u.mixin,props],
		computed: {
			gapStyle() {
				const style = {
					backgroundColor: this.bgColor,
					height: uni.$u.addUnit(this.height),
					marginTop: uni.$u.addUnit(this.marginTop),
					marginBottom: uni.$u.addUnit(this.marginBottom),
				}
				return uni.$u.deepMerge(style, uni.$u.addStyle(this.customStyle))
			}
		}
	};
</script>

<style lang="scss" scoped>
	/* #ifndef APP-NVUE */
	// 所以在非nvue中，需要对元素进行重置为flex-direction: column; 否则可能会表现异常
	view, scroll-view, swiper-item {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		flex-grow: 0;
		flex-basis: auto;
		align-items: stretch;
		align-content: flex-start;
	}
	/* #endif */
</style>
