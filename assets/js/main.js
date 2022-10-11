jQuery( function( $ ) {

	var verifica_formato_cep = function(val) {
		var verifica = /^[0-9]{5}-[0-9]{3}$/;
		val = $.trim(val);
		if(verifica.test( val )) {
			return true;
		} else {
			return false;
		}
	};

	var exibe_esconde_campos_checkout = function(val, key, force_show, fields ) {

		if( typeof key === 'undefined' ) {
			key = 'billing';
		}


		if( typeof force_show !== 'undefined' && typeof fields !== 'undefined' ) {
			console.log( '1' );
			console.log( 'force_show: ' + force_show );
			console.log( 'fields: ' + fields );
			if( force_show && fields ) {
				console.log('1.1');
				for (var a = fields.length - 1; a >= 0; a--) {
					fields[a].addClass('visivel');
				}
			} else if( !force_show && fields ){
				console.log('1.2');
				for (var b = fields.length - 1; b >= 0; i--) {
					fields[b].removeClass('visivel');
				}
			}
		} else if( verifica_formato_cep(val) ) {
			console.log('key: ' + key);
			console.log('2');
			$('#' + key + '_address_1_field, #' + key + '_number_field, #' + key + '_address_2_field, #' + key + '_neighborhood_field, #' + key + '_city_field, #' + key + '_state_field').addClass('visivel');
		} else {
			console.log('key: ' + key);
			console.log('3');
			$('#' + key + '_address_1_field, #' + key + '_number_field, #' + key + '_address_2_field, #' + key + '_neighborhood_field, #' + key + '_city_field, #' + key + '_state_field').removeClass('visivel');
		}

	};

	var verifica_se_tem_um_espaco = function(val){
		return val.indexOf(' ') >= 0;
	};

	var preenche_nome_sobrenome = function() {
		$('.nome-completo').each(function(){
			var nome = $(this).find('input');
			var row = nome.closest('.form-row');
			var first_name = nome.closest('.clear').find('.primeiro-nome').find('input');
			var last_name = nome.closest('.clear').find('.sobrenome').find('input');
			$(nome).keyup(function(){
				var primeiro_nome = '';
				var sobrenome = '';
				var css_class = nome.attr('class');
				val = $.trim($(this).val());
				if(verifica_se_tem_um_espaco(val)) {
					primeiro_nome = val.substr(0, val.indexOf(' '));
					sobrenome = val.substr(val.indexOf(' ') + 1);
				} else {
					primeiro_nome = val;
				}
				first_name.val($.trim(primeiro_nome));
				last_name.val($.trim(sobrenome));

				if(row.hasClass('invalido')) {
					valida_nome_completo(nome);
				}
			}); // $(nome).keyup
			nome.blur(function(){
				valida_nome_completo(nome);
			});
		});
	};

	var valida_nome_completo = function(nome){
		var row = nome.closest('.form-row');
		val = $.trim(nome.val());
		if(!verifica_se_tem_um_espaco(val)) {
			row.addClass('invalido');
		} else {
			row.removeClass('invalido');
		}
	};

	var nome_completo_init = function(){
		preenche_nome_sobrenome();
	};

	var muda_foco_para_numero = function(){
		$('#billing_postcode').each(function(){
			var cep_input = $(this);
			var cep_row = cep_input.closest('.form-row');
			var numero_row = cep_input.closest('form').find('#billing_number_field');
			var numero_input = numero_row.find('input');
			var rua_input = $('#billing_address_1');
			cep_input.blur(function(e){
				if(cep_input.val() !== '' && numero_row.is(':visible')) {
					if(rua_input.val() !== '') {
						numero_input.focus();
					} else {
						rua_input.focus();
					}
				} else if(cep_row.hasClass('woocommerce-invalid') || cep_row.hasClass('woocommerce-invalid-required-field') ) {
					e.preventDefault();
					cep_input.focus();
				}
			});
		});
	};

	var addressAutoComplete = function( field ) {
		// Checks with *_postcode field exist.
		if ( $( '#' + field + '_postcode' ).length ) {

			// Valid CEP.
			var cep       = $( '#' + field + '_postcode' ).val().replace( '.', '' ).replace( '-', '' ),
				country   = $( '#' + field + '_country' ).val(),
				address_1 = $( '#' + field + '_address_1' ).val();

			// Check country is BR.
			if ( cep !== '' && 8 === cep.length && 'BR' === country/* && 0 === address_1.length*/ ) {

				var correios = $.ajax({
					type: 'GET',
					url: '//viacep.com.br/ws/' + cep + '/json/',
					dataType: 'jsonp',
					crossDomain: true,
					contentType: 'application/json'
				});

				// Gets the address.
				correios.done( function ( address ) {

					// console.log('addressAutoComplete');

					// Address.
					if( address.logradouro ) {
						// console.log('encontrou logradouro');
						$( '#' + field + '_address_1' ).val( address.logradouro ).attr( 'readonly', 'readonly' ).change().closest( '.form-row' ).addClass( 'disabled-input' );
					} else {
						// console.log('não encontrou logradouro');
						$( '#' + field + '_address_1' ).attr('readonly', false).val( '' ).change().closest( '.form-row' ).removeClass( 'disabled-input' );
					}

					// Neighborhood.
					if( address.logradouro ) {
						$( '#' + field + '_neighborhood' ).val( address.bairro ).attr( 'readonly', 'readonly' ).change().closest( '.form-row' ).addClass( 'disabled-input' );
					} else {
						$( '#' + field + '_neighborhood' ).attr('readonly', false).val( '' ).change().closest( '.form-row' ).removeClass( 'disabled-input' );
					}

					// City.
					if( '' !== address.localidade ) {
						$( '#' + field + '_city' ).val( address.localidade ).change();
					} else {
						exibe_esconde_campos_checkout(val, field, true, array( $( '#' + field + '_city' ) ) );
					}

					// State.
					if( '' !== address.uf ) {
						$( '#' + field + '_state option:selected' ).attr( 'selected', false ).change();
						$( '#' + field + '_state option[value="' + address.uf + '"]' ).attr( 'selected', 'selected' ).change();
						$( '#' + field + '_state' ).val( address.uf ).change();
					} else {
						exibe_esconde_campos_checkout(val, field, true, array( $( '#' + field + '_state' ) ) );
					}

					// Chosen support.
					$( '#' + field + '_state' ).trigger( 'liszt:updated' ).trigger( 'chosen:updated' );

					$('#' + field + '_number').focus();

					if( $('.cep-notice').length ) {
						$('.cep-notice').remove();
					}

				}).fail( function( jqXHR, textStatus, errorThrown ){

					if( !$('.cep-notice').length ) {

						var msg = $('<div class="cep-notice"><div class="woocommerce-messages alert-color"><div class="message-wrapper"><ul class="woocommerce-error"><li><div class="message-container container"><span class="message-icon icon-close"><strong>CEP</strong> não encontrado. Digite outro CEP ou preencha manualmente o restante das informações do endereço.</span></div></li></ul></div></div></div>');

						$('#' + field + '_postcode').focus();
						$('#' + field + '_postcode').closest('form.checkout.woocommerce-checkout').prepend(msg);

					}

				});
			}
		}
	};

	var addressAutoCompleteOnChange = function( field ) {
		// $( document.body ).on( 'blur', '#' + field + '_postcode', function() {
			addressAutoComplete( field );
		// });
	};

	var init_cep = function() {

		addressAutoComplete( 'billing' );

		billing_cep_input = $('#billing_postcode');
		shipping_cep_input = $('#shipping_postcode');

		exibe_esconde_campos_checkout(billing_cep_input.val(), 'billing' );

		billing_cep_input.keyup(function(){
			var val = $(this).val();
			// console.log('keyup');
			// console.log('val.length: ' + val.length);
			exibe_esconde_campos_checkout(val, 'billing' );
			if(val.length === 9) {
				// console.log('val.length == 9');
				addressAutoComplete( 'billing' );
				$( 'body' ).trigger( 'update_checkout' );
			}
		});		
		
		exibe_esconde_campos_checkout(shipping_cep_input.val(), 'shipping' );
	
		shipping_cep_input.keyup(function(){
			var val = $(this).val();
			// console.log('keyup');
			// console.log('val.length: ' + val.length);
			exibe_esconde_campos_checkout(val, 'shipping' );
			if(val.length === 9) {
				// console.log('val.length == 9');
				addressAutoComplete( 'shipping' );
				$( 'body' ).trigger( 'update_checkout' );
			}
		});		
	
		$('.address-field').find('input').each(function(){
			var input = $(this);
			input.keydown(function(e){
				if(input.attr('id') !== 'billing_postcode' && !input.closest('.address-field').hasClass('visivel')) {
					e.preventDefault();
				}
			});
		});

	};

	var masks_init = function(){
		// $( '.rg-mask' ).find( 'input' ).mask( '00.000.000-0' );
		$( '.cep-mask' ).find( 'input' ).mask( '00000-000' );
		$( '.cep-mask-input' ).mask( '00000-000' );
		$( '#billing_postcode' ).mask( '00000-000' );
		$( '#shipping_postcode' ).mask( '00000-000' );
		$( '.fone-mask-input' ).mask( '(00) 90000-0000' );
	};

	var desativa_campos = function() {
		$('.disabled-input').each(function(){
			var input = $(this).find('input, textarea');
			if( input.length ) {
				input.attr('readonly', 'readonly');
			}
		});
	};

	var fix_layout_inscricao_estadual = function(){
		$( '#billing_persontype' ).on( 'change', function () {
			var current = $( this ).val();
			if( $('#billing_ie').length > 0  ) {
				var ie = $('#billing_ie');
				var ie_row = ie.closest( '.form-row ');
				var wrap = ie_row.closest( '.woocommerce-billing-fields__field-wrapper' );
				wrap.find( '.form-row ').each( function(i){
					if( $( this ).index() > ie_row.index() ) {
						var current_row = $( this );
						var css_class = '';
						if( current_row.hasClass( 'form-row-first' ) ) {
							css_class = current_row.attr( 'class' );
							css_class = css_class.replace( 'first', 'last' );
							current_row.attr( 'class', css_class );
						}
						else if( current_row.hasClass( 'form-row-last' ) ) {
							css_class = current_row.attr( 'class' );
							css_class = css_class.replace( 'last', 'first' );
							current_row.attr( 'class', css_class );
						}
					}
				} );
			}
		});
	};

	var fix_mobile_menu = function() {
		var mobile_menu = $('.mobile-sidebar .sidebar-menu .nav');
		mobile_menu.find('a').each(function(){
			var a = $(this);
			var toggle = a.next('.toggle');
			if(toggle.length > 0 && a.attr('href') === '#') {
				a.off().click(function(e){
					toggle.click();
					e.preventDefault();
				}); // a.click
			}
		});
	};

	$(document).ready(function(){
		masks_init();
		init_cep();
		nome_completo_init();
		desativa_campos();
		fix_layout_inscricao_estadual();
		fix_mobile_menu();
	}); // $(document).ready

});