/**
 * Created by vincent on 16/11/8.
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
    ;
}(function ($) {
    const keyState = "asSelect";
    var plugin = function (options, param) {
        if (typeof options == 'string') {
            return plugin.methods[options]($(this), param);
        }

        options = options || {};
        return this.each(function () {
            var $this=$(this);
            var state = $this.data( keyState);
            if (state) {
                $.extend(state.options, options);
            } else {
                $.data(this, keyState, {
                    options: $.extend({}, plugin.defaults, options)
                });
            }

            if (typeof options.url === 'string') {
                $.getJSON(options.url, function(json){
                    $.extend($this.data(keyState), {
                        data: json
                    });
                    initHtml($this);
                });
            } else {
                $.extend($this.data(keyState), {
                    data: options.url
                });
                initHtml($this);
            }

        });
    };
    function initHtml(jq) {
        var state = jq.data(keyState);
        var options = state.options;
        var select=jq.find('select[name="'+options.selects[0]+'"]');
        if (!options.required) {
            $('<option>').attr('value',options.firstValue)
                .html(options.firstKey).appendTo(select);
        }
        $.each(state.data,function (i,data) {
            newOption(jq,options.selects[0],data);
        });
        jq.on('change','select',function () {
            var i=0;
            for(;i<options.selects.length;i++){
                if(options.selects[i]==$(this).attr('name')){
                    break;
                }
            }
            selectChange(jq, i);
        });
        var options=jq.data(keyState).options;
        for(var i=0;i<options.selects.length;i++){
            jq.find('select[name="'+options.selects[i]+'"]').trigger('change');
        }
    }
    function queryNextListData(jq,n) {
        var state=jq.data(keyState);
        var selects=state.options.selects;
        var sub=state.data;
        for(var i=0;i<n+1;i++){
            var select=selects[i];
            var val=jq.find('select[name="'+select+'"]').val();

            for(var j=0;j<sub.length;j++){
                var sx=sub[j];
                if(sx==undefined|| sx.v==undefined){
                    break;
                }
                if(sx.v==val){
                    if(sx.s) {
                        sub = sx.s;
                    }else {
                        sub=[];
                    }
                }
            }
        }

        return sub;
    }
    function selectChange(jq,i) {
        var state=jq.data(keyState);
        var options=state.options;
        var selects=options.selects;
        var nextName=selects[i+1];
        var nextListData=queryNextListData(jq,i);
        selects.slice(i+1).map(function (name) {
            jq.find('select[name="'+name+'"]').empty();
            jq.find('select[name="'+name+'"]').attr('disabled',true);
        })
        if(nextName && $.isArray( nextListData)){
            var select=jq.find('select[name="'+nextName+'"]');
            select.attr('disabled',nextListData.length==0);
            if (!options.required) {
                $('<option>').attr('value',options.firstValue)
                    .html(options.firstKey).appendTo(select);
            }
            $.each(nextListData,function (i,data) {
                newOption(jq,nextName,data);
            });
        }
    }
    function newOption(jq,name,data) {
        var options=jq.data(keyState).options;
        var select=jq.find('select[name="'+name+'"]');
        $('<option>').attr('value',data.v).html(data.n).appendTo(select);
    }
    function setValue(jq, values) {
        if(!$.isArray(values)){
            console.log('values not object');
            return;
        }
        var options=jq.data(keyState).options;
        $.each(values,function(i,name){
            jq.find('select[name="'+options.selects[i]+'"]').val(values[i]);
            jq.find('select[name="'+options.selects[i]+'"]').trigger('change');
        });
    }
    function getValue(jq) {
        var options=jq.data(keyState).options;
        var rtn=[]
        $.each(options.selects,function(i,name){
            var val=jq.find('select[name="'+name+'"]').val();
            if(val){
                rtn.push(val);
            }

        });
        return rtn;
    }

    plugin.methods = {
        setValue: function (jq, values) {
            return jq.each(function () {
                return setValue($(this), values);
            });
        },
        getValue:function(jq){
            return getValue(jq);
        },
        reset:function(jq){
            return jq.each(function () {
                return setValue($(this),['']);
            })
        }
    };

    plugin.defaults = {
        url: '',
        selects: [],
        required: true,
        firstKey: '请选择',
        firstValue: '',
    };
    $.fn.asSelect = plugin;
}));