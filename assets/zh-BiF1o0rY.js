const n=`# Mandarin starter: the first story a newcomer reads, with the coach beside
# it, and its part two. Written for this app (unencumbered); the header is
# explained in es.txt. Simplified characters and mainland punctuation (“ ”),
# as the pack's stories are written.
#
# Mandarin has no other form of a word, so there is no @form: the coach skips
# that step. A beginner knows no word of it on sight, so there is no @known:
# 我 is @learn, marked Learning in the second sentence and Known at the next
# meeting, and in nearly every sentence after. The anchor is a loanword a
# beginner can guess from its pinyin (可乐 kělè).
#
# The phrase is 欢迎光临, what every shop door in China says, often from a
# recorded voice, which is why a parrot can say it and nothing else. The
# segmenter takes it whole, as it does every unbroken set phrase (chengyu
# too: phrases.txt), so it is one headword, glossed whole, not a pattern in
# phrases.txt; the coach rings it as a word and says it is a phrase written
# as one. The sentence to translate is 我把可乐都卖完了: 把 brings the cola
# before the verb and 完 after it says the selling is finished, which no
# card shows one word at a time. The shop is a 小店 (小卖部 cuts badly).

@anchor 可乐
@learn 我
@phrase 欢迎光临
@translate 我把可乐都卖完了

## 小店的鹦鹉
我想喝可乐。我走进一家小店，店里没有人，只有一只鹦鹉。

“欢迎光临！”鹦鹉说。

“你好，有可乐吗？”我问。

“欢迎光临！”

它只会说这一句。我就自己拿了一瓶可乐。

这时，进来一个人。

“欢迎光临！”鹦鹉说。

“有可乐吗？”他问我。

“有！”我给了他一瓶。

后来又进来很多人。

“欢迎光临！欢迎光临！欢迎光临！”

我把可乐都卖完了。

这时，老板回来了。他看看我，又看看鹦鹉。

“欢迎光临！”鹦鹉说。

## 第一天
第二天，老板对我说：“你来卖东西吧。你只要说‘欢迎光临’就行。”

进来一个老奶奶。

“有茶吗？”

“欢迎光临！”我说。

“茶！有没有茶？”

“欢迎光临！”

最后，她买了一瓶可乐。

一个人跑进来：“多少钱？”

“欢迎光临！”

他放下十块钱，就走了。

又进来一个外国人。

“你好！你会说中国话吗？”

我看看他，不知道说什么。

“会一点。”鹦鹉说。
`;export{n as default};
